import zlib from 'zlib'
import path from 'path'
import fs from 'fs'
import request from 'supertest'
import {PassThrough} from 'stream'
import jwt from 'jsonwebtoken'

import {closeDb, connectDb} from './db'
import {
  administratorRequest,
  customerRequest,
  publicRequest,
  subscriberRequest,
  syncRequest,
} from './utils/test/userRequests'
import app from './app'
import generateAuth from './controllers/utils/generateAuth'
import {subscriber} from './utils/test/users'
import * as constants from './constants'
import {JWT_SECRET} from './constants'

import InfinityMap from './models/InfinityMap'
import MapImage from './models/MapImage'
import Thumbnail from './models/Thumbnail'
import User from './models/User'
import MapChanges from './models/MapChanges'
import ClientError from './models/ClientError'
import MapFile from './models/MapFile'
import Automerge from 'automerge'

const JPG_GZIP_BASE64 =
  'H4sICAZZ6l0AA3Rlc3Qtdy0xLmpwZwClzbkNgDAQRNEZNiEg8EqU4R5AQrIETdEaAUVwJHSyrEOO' +
  'zD98wYxtdiFMaUygFxkBOzHASvMRFo8s0BoEhYpKKUpb0bo8k6zhrcjKX9WvHmiEfiKKDv1s+w3f' +
  'ONr/GwEAAA=='

const FILENAME = 'myFileName.jpg'

const IMAP_FILE_PATH = 'test/Introduction.iMap'

const userId = generateAuth(subscriber).wp_user.ID

const refreshTokenCookieRegex = /refresh_token=([^;]+);.*/
const accessTokenCookieRegex = /auth=([^;]+);.*/

let imageData

beforeAll(async () => {
  imageData = await new Promise((resolve, reject) =>
    zlib.unzip(Buffer.from(JPG_GZIP_BASE64, 'base64'), (err, buffer) => {
      if (err) {
        reject(err)
      } else {
        resolve(buffer)
      }
    }),
  )
})

beforeAll(async () => {
  await connectDb()
  await Promise.all([
    ClientError.init(),
    InfinityMap.init(),
    MapImage.model.init(),
    MapFile.model.init(),
    Thumbnail.model.init(),
    MapChanges.init(),
    User.init(),
  ])
}, 60000)

afterAll(closeDb)

const mapData = {
  nodes: {
    rootId: {id: 'rootId', title: 'test root node', children: ['childId'], tags: []},
    childId: {id: 'childId', title: 'test child node', children: [], parent: 'rootId', tags: []},
  },
  edges: {rootId_childId: {id: 'rootId_childId', start: 'rootId', end: 'childId', title: 'relation'}},
  share: {public: {enabled: false}},
  title: 'test title',
  root: 'rootId',
}

describe('map life-cycle', () => {
  let mapId

  beforeAll(async () => {
    await InfinityMap.deleteMany({userId})
    const map = new InfinityMap({userId, ...mapData})
    await map.save()
    mapId = map.mapId
  })

  it('should create new maps on api', async () => {
    const response = await subscriberRequest.post('/maps').send()

    expect(response.status).toBe(200)
  })

  it('should not accept updates on api', async () => {
    const response = await subscriberRequest.put(`/maps/${mapId}`).send(JSON.stringify(mapData))

    expect(response.status).toBe(400)
  })

  it('should not accept updates on api', async () => {
    const response = await subscriberRequest.patch(`/maps/${mapId}`).send(JSON.stringify(mapData))

    expect(response.status).toBe(400)
  })

  it('should not accept unauth requests to the map', async () => {
    const response = await publicRequest.get(`/maps/${mapId}`)

    expect(response.status).toBe(401)
  })

  it('should be writeable for user', async () => {
    const response = await subscriberRequest.get(`/maps/${mapId}/writeable`)

    const data = JSON.parse(response.res.text)

    expect(response.status).toBe(200)
    expect(data.writeable).toBe(true)
  })

  it('should not allow writeable endpoint for unauth user', async () => {
    const response = await publicRequest.get(`/maps/${mapId}/writeable`)

    expect(response.status).toBe(401)
  })

  it('should serve the created map', async () => {
    const response = await subscriberRequest.get(`/maps/${mapId}`)

    expect(response.status).toBe(200)

    const map = JSON.parse(response.res.text)
    expect(map).toMatchObject(mapData)
  })

  it('should serve all maps', async () => {
    const response = await subscriberRequest.get('/maps?public=false')

    expect(response.status).toBe(200)
    expect(JSON.parse(response.res.text).length).toBeGreaterThan(0)
  })

  it('should export and import a map', async () => {
    const responseExport = await subscriberRequest.get(`/maps/${mapId}/export`)

    expect(responseExport.status).toBe(200)

    const exportedMap = JSON.parse(responseExport.res.text)
    const {share, ...rawMapData} = mapData

    expect(exportedMap).toMatchObject(rawMapData)

    const responseImport = await subscriberRequest.post('/maps/import').send(JSON.stringify(exportedMap))

    expect(responseImport.status).toBe(200)

    const {mapId: importedMapId} = JSON.parse(responseImport.res.text)

    const importedMap = await InfinityMap.findOne({mapId: importedMapId})

    expect(JSON.parse(JSON.stringify(importedMap))).toMatchObject({...rawMapData, mapId: importedMapId})
  })

  it('should compact operations and changes', async () => {
    const firstDoc = Automerge.from(mapData)
    const changedDoc = Automerge.change(firstDoc, doc => {
      doc.nodes.childId.title = 'a totally different title'
      doc.nodes.rootId.title = 'another totally different title'
    })

    const changes = Automerge.Frontend.getBackendState(changedDoc).getIn(['opSet', 'history']).toJS()
    await new MapChanges({mapId, changes, userId}).save()

    const response = await subscriberRequest.post(`/maps/${mapId}/repair`)

    const result = JSON.parse(response.res.text)

    expect(response.status).toBe(200)
    expect(result.reducedOpsSize).toBe(result.originalOpsSize - 2)
    expect(result.reducedChangesSize).toBe(3)
    expect(result.originalChangesSize).toBe(2)
  })

  it('should not accept unauth requests to delete map', async () => {
    const response = await publicRequest.delete(`/maps/${mapId}`)

    expect(response.status).toBe(401)
  })

  it('should delete the map', async () => {
    const response = await subscriberRequest.delete(`/maps/${mapId}`)

    expect(response.status).toBe(200)
    expect(JSON.parse(response.res.text).success).toBe(true)
  })

  it('should not find the map anymore', async () => {
    const response = await subscriberRequest.get(`/maps/${mapId}`)

    expect(response.status).toBe(404)
  })
})

describe('public map life-cycle', () => {
  let mapId

  beforeAll(async () => {
    const map = InfinityMap({userId, ...mapData})
    await map.save()
    mapId = map.mapId
  })

  afterAll(async () => {
    if (mapId) await InfinityMap.deleteOne({mapId})
  })

  it('should not yet accept unauth requests to the map', async () => {
    const response = await publicRequest.get(`/maps/${mapId}`)

    expect(response.status).toBe(401)
  })

  it('should be marked public successfully', async () => {
    const response = await subscriberRequest.post(`/maps/${mapId}/share/public`).send(JSON.stringify({enabled: true}))

    expect(response.status).toBe(200)
    expect(JSON.parse(response.res.text).success).toBe(true)
  })

  it('should accept unauth requests to list public maps', async () => {
    const response = await publicRequest.get('/maps')

    expect(response.status).toBe(200)
    expect(JSON.parse(response.res.text).length).toBeGreaterThan(0)
  })

  it('should serve the public map', async () => {
    const response = await publicRequest.get(`/maps/${mapId}`)

    expect(response.status).toBe(200)

    const map = JSON.parse(response.res.text)
    Object.entries({...mapData, share: {public: {enabled: true}, access: []}}).forEach(([key, value]) => {
      expect(map).toHaveProperty(key, value)
    })
  })
})

describe('map-image live cycle', () => {
  let mapId
  let imageId

  beforeAll(async () => {
    const imageMap = InfinityMap({userId})
    await imageMap.save()
    mapId = imageMap.mapId
  })

  afterAll(async () => {
    await InfinityMap.deleteOne({mapId})
  })

  it('should not accept unauth requests to upload images', async () => {
    const response = await publicRequest
      .post(`/maps/${mapId}/images`)
      .query({filename: FILENAME})
      .type('jpg')
      .send(imageData)

    expect(response.status).toBe(401)
  })

  it('should accept new images', async () => {
    const response = await subscriberRequest
      .post(`/maps/${mapId}/images`)
      .query({filename: FILENAME})
      .type('jpg')
      .send(imageData)

    const image = JSON.parse(response.res.text)

    expect(response.status).toBe(200)
    expect(image).toHaveProperty('_id')
    imageId = image._id
  })

  it('should not accept unauth requests to serve images', async () => {
    const response = await publicRequest.get(`/maps/${mapId}/images/${imageId}`)

    expect(response.status).toBe(401)
  })

  it('should serve the created image', async () => {
    const response = await subscriberRequest.get(`/maps/${mapId}/images/${imageId}`)

    expect(response.status).toBe(200)
    expect(Buffer.from(response.body).equals(imageData)).toBe(true)
  })

  it('should list the images', async () => {
    const response = await subscriberRequest.get(`/maps/${mapId}/images`)

    expect(response.status).toBe(200)
    expect(JSON.parse(response.res.text).length).toBe(1)
  })

  it('should not accept unauth requests to delete images', async () => {
    const response = await publicRequest.delete(`/maps/${mapId}/images/${imageId}`)

    expect(response.status).toBe(401)
  })

  it('should delete the image', async () => {
    const response = await subscriberRequest.delete(`/maps/${mapId}/images/${imageId}`)

    expect(response.status).toBe(200)
    expect(JSON.parse(response.res.text).success).toBe(true)
  })

  it('should not find the image anymore', async () => {
    const response = await subscriberRequest.get(`/maps/${mapId}/images/${imageId}`)

    expect(response.status).toBe(404)
  })

  it('should not find image after map is deleted', async () => {
    const createResponse = await subscriberRequest
      .post(`/maps/${mapId}/images`)
      .query({filename: FILENAME})
      .type('jpg')
      .send(imageData)

    expect(createResponse.status).toBe(200)

    const image = JSON.parse(createResponse.res.text)
    expect(image).toHaveProperty('_id')
    imageId = image._id

    const deleteResponse = await subscriberRequest.delete(`/maps/${mapId}`)
    expect(deleteResponse.status).toBe(200)

    const response = await subscriberRequest.get(`/maps/${mapId}/images/${imageId}`)
    expect(response.status).toBe(404)
  })
})

describe('map-file live cycle', () => {
  let mapId
  let fileId
  let fileData

  beforeAll(() => {
    fileData = imageData
  })

  beforeAll(async () => {
    const fileMap = InfinityMap({userId})
    await fileMap.save()
    mapId = fileMap.mapId
  })

  it('should not accept unauth requests to upload files', async () => {
    const response = await publicRequest
      .post(`/maps/${mapId}/files`)
      .query({filename: FILENAME})
      .type('jpg')
      .send(fileData)

    expect(response.status).toBe(401)
  })

  it('should accept new files', async () => {
    const response = await subscriberRequest
      .post(`/maps/${mapId}/files`)
      .query({filename: FILENAME})
      .type('jpg')
      .send(fileData)

    const file = JSON.parse(response.res.text)

    expect(response.status).toBe(200)
    expect(file).toHaveProperty('_id')
    fileId = file._id
  })

  it('should not accept unauth requests to serve files', async () => {
    const response = await publicRequest.get(`/maps/${mapId}/files/${fileId}`)

    expect(response.status).toBe(401)
  })

  it('should serve the created file', async () => {
    const response = await subscriberRequest.get(`/maps/${mapId}/files/${fileId}`)

    expect(response.status).toBe(200)
    expect(Buffer.from(response.body).equals(fileData)).toBe(true)
  })

  // TODO: this should be done in the backend
  // it('should serve the thumbnail', async () => {
  //   const thumbnail = new Thumbnail({filename: `${FILENAME}-thumbnail.jpg`, metadata: {mapId, fileId, userId}})
  //   const fileStream = new PassThrough()
  //   fileStream.end(fileData)
  //   await thumbnail.write(fileStream)
  //
  //   const response = await subscriberRequest.get(`/maps/${mapId}/files/${fileId}/thumbnail`)
  //
  //   expect(response.status).toBe(200)
  //   expect(Buffer.from(response.body).equals(fileData)).toBe(true)
  // })

  it('should list the files', async () => {
    const response = await subscriberRequest.get(`/maps/${mapId}/files`)

    expect(response.status).toBe(200)
    expect(JSON.parse(response.res.text).length).toBe(1)
  })

  it('should not accept unauth requests to delete files', async () => {
    const response = await publicRequest.delete(`/maps/${mapId}/files/${fileId}`)

    expect(response.status).toBe(401)
  })

  it('should delete the file', async () => {
    const response = await subscriberRequest.delete(`/maps/${mapId}/files/${fileId}`)

    expect(response.status).toBe(200)
    expect(JSON.parse(response.res.text).success).toBe(true)
  })

  it('should not find the file anymore', async () => {
    const response = await subscriberRequest.get(`/maps/${mapId}/files/${fileId}`)

    expect(response.status).toBe(404)
  })

  it('should not find file after map is deleted', async () => {
    const createResponse = await subscriberRequest
      .post(`/maps/${mapId}/files`)
      .query({filename: FILENAME})
      .type('jpg')
      .send(fileData)

    expect(createResponse.status).toBe(200)

    const file = JSON.parse(createResponse.res.text)
    expect(file).toHaveProperty('_id')
    fileId = file._id

    const deleteResponse = await subscriberRequest.delete(`/maps/${mapId}`)
    expect(deleteResponse.status).toBe(200)

    const response = await subscriberRequest.get(`/maps/${mapId}/files/${fileId}`)
    expect(response.status).toBe(404)
  })
})

describe('map upload', () => {
  let mapId

  afterAll(async () => {
    if (mapId) await InfinityMap.deleteOne({mapId})
  })

  it('should upload a new imapping file', async () => {
    const response = await subscriberRequest
      .post('/maps/import/imapping')
      .query({filename: path.basename(IMAP_FILE_PATH)})
      .type('zip')
      .send(fs.readFileSync(IMAP_FILE_PATH))

    expect(response.status).toBe(200)
    const map = JSON.parse(response.res.text)

    expect(map).toHaveProperty('mapId')
    mapId = map.mapId
  }, 30000)

  // TODO: check pictures are accessible

  it('should serve the uploaded map', async () => {
    const response = await subscriberRequest.get(`/maps/${mapId}`)

    expect(response.status).toBe(200)
    const map = JSON.parse(response.res.text)

    expect(map).toHaveProperty('_id')
    expect(map).toHaveProperty('root')
    expect(map).toHaveProperty('nodes')
    expect(map).toHaveProperty('edges')
    expect(map).toHaveProperty('title')
  })
})

describe('non rest endpoints', () => {
  it('should serve metrics', async () => {
    const response = await request(app.callback()).get('/metrics')

    const text = response.res.text

    expect(response.status).toBe(200)
    expect(text).toMatch(/.*http_request_count.*/)
    expect(text).toMatch(/.*http_request_duration_seconds.*/)
    expect(text).toMatch(/.*http_request_size_bytes.*/)
    expect(text).toMatch(/.*http_response_size_bytes.*/)
  })

  it('should return healthz status', async () => {
    const response = await request(app.callback()).get('/healthz')

    expect(response.status).toBe(200)
    expect(response.res.text).toBe('OK')
  })
})

describe('client error handling', () => {
  it('should accept errors', async () => {
    const response = await subscriberRequest.post('/errors').send({
      backtrace: 'test',
      addition: 'additional information',
      path: '/test',
      mapId: 'test-map-id',
      userId: 'any-user-id',
    })

    const data = JSON.parse(response.res.text)

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})

describe('unknown paths', () => {
  it('should fail with 404 for user requests', async () => {
    const response = await subscriberRequest.get('/any/unknown/url')

    expect(response.status).toBe(404)
    expect(response.res.text).toBe('Not Found')
  })
  it('should fail with 404 for public requests', async () => {
    const response = await publicRequest.get('/another/unknown/url')

    expect(response.status).toBe(404)
    expect(response.res.text).toBe('Not Found')
  })
})

describe('user life-cycle', () => {
  const id = subscriber.name
  const name = subscriber.name
  const password = subscriber.password
  const mail = subscriber.mail
  let token

  beforeAll(async () => {
    await User.deleteOne({name})
  })

  afterAll(async () => {
    await User.deleteOne({name})
  })

  it('should create a new user', async () => {
    const newUser = new User({id, name, password, mail})
    await newUser.save()
  })

  // it('should not serve the user object without authetication', async () => {
  //   const response = await publicRequest.get(`/user/${name}`)
  //
  //   expect(response.status).toBe(401)
  // })
  //
  // it('should serve the user object', async () => {
  //   const response = await subscriberRequest.get(`/user/${name}`)
  //
  //   expect(response.status).toBe(200)
  //
  //   const data = JSON.parse(response.res.text)
  //   expect(data.password).toBe(undefined)
  //   expect(data.name).toBe(name)
  //   expect(data.mail).toBe(mail)
  // })
  //
  it('should authenticate the user', async () => {
    const response = await publicRequest.post('/auth').send({username: subscriber.name, password: subscriber.password})

    expect(response.status).toBe(200)

    const data = JSON.parse(response.res.text)
    expect(data?.wp_user?.ID).toBe(subscriber.name)

    const refreshToken = response.headers['set-cookie']
      .find(str => refreshTokenCookieRegex.test(str))
      ?.match(refreshTokenCookieRegex)[1]

    expect(refreshToken).toBeDefined()
    expect(() => jwt.verify(refreshToken, JWT_SECRET)).not.toThrow()

    token = refreshToken
  })

  it('should refresh the authentication token', async () => {
    const response = await publicRequest
      .post('/auth/refresh')
      .set('Cookie', [`refresh_token=${token}`])
      .send()

    expect(response.status).toBe(200)

    const accessToken = response.headers['set-cookie']
      .find(str => accessTokenCookieRegex.test(str))
      ?.match(accessTokenCookieRegex)[1]

    expect(accessToken).toBeDefined()
    expect(() => jwt.verify(accessToken, JWT_SECRET)).not.toThrow()
  })

  it('should ask for relogin on wrong authentication', async () => {
    const response = await publicRequest.post('/auth').send({username: subscriber.name, password: 'wrong'})

    expect(response.status).toBe(401)
  })

  it('should ask for relogin when token is expired', async () => {
    const oldTtl = constants.JWT_TTL
    constants.JWT_TTL = 0
    const expiredToken = generateAuth(subscriber)
    constants.JWT_TTL = oldTtl

    const response = await publicRequest
      .post('/auth/refresh')
      .set('Cookie', [`refresh_token=${expiredToken}`])
      .send()

    expect(response.status).toBe(401)
  })
})

describe('private template life-cycle', () => {
  let userTemplateId
  const {title, ...mapTemplateData} = mapData
  const userTemplateData = {
    ...mapTemplateData,
    name: 'user test template',
    keywords: ['test'],
    share: {public: false},
  }

  it('should accept new templates from authenticated user', async () => {
    const response = await subscriberRequest.post('/templates').send(JSON.stringify(userTemplateData))

    expect(response.status).toBe(200)

    const data = JSON.parse(response.res.text)
    expect(data.templateId).toBeDefined()

    userTemplateId = data.templateId
  })

  it('should not accept templates from unauthenticated user', async () => {
    const response = await publicRequest.post('/templates').send(JSON.stringify(userTemplateData))

    expect(response.status).toBe(401)
  })

  it('should serve private templates to the creater', async () => {
    const response = await subscriberRequest.get(`/templates/${userTemplateId}`)

    expect(response.status).toBe(200)

    const data = JSON.parse(response.res.text)
    expect(data).toMatchObject(userTemplateData)
  })

  it('should not serve private templates to other users', async () => {
    const response = await customerRequest.get(`/templates/${userTemplateId}`)

    expect(response.status).toBe(403)
  })

  it('should list the template', async () => {
    const response = await subscriberRequest.get('/templates')

    expect(response.status).toBe(200)

    const data = JSON.parse(response.res.text)
    expect(data).toBeInstanceOf(Array)
    expect(data.map(({_id}) => _id)).toContain(userTemplateId)
  })

  it('should accept a new version with an existing id', async () => {
    const name = 'new version'

    const response = await subscriberRequest
      .post('/templates')
      .send(JSON.stringify({...userTemplateData, name, _id: userTemplateId}))

    expect(response.status).toBe(200)

    const data = JSON.parse(response.res.text)
    expect(data.templateId).toBe(userTemplateId)

    const verifyResponse = await subscriberRequest.get(`/templates/${userTemplateId}`)

    const newData = JSON.parse(verifyResponse.res.text)

    expect(newData).toMatchObject({...userTemplateData, name})
  })

  it('should delete the template', async () => {
    const response = await subscriberRequest.delete(`/templates/${userTemplateId}`)

    expect(response.status).toBe(200)

    const data = JSON.parse(response.res.text)
    expect(data.success).toBe(true)
  })
})

describe('public template life-cycle', () => {
  let publicTemplateId
  const {title, ...mapTemplateData} = mapData
  const publicTemplateData = {
    ...mapTemplateData,
    name: 'public test template',
    keywords: ['test'],
    share: {public: true},
  }

  it('should accept new public templates from admin user', async () => {
    const response = await administratorRequest.post('/templates').send(JSON.stringify(publicTemplateData))

    expect(response.status).toBe(200)

    const data = JSON.parse(response.res.text)
    expect(data.templateId).toBeDefined()

    publicTemplateId = data.templateId
  })

  it('should not accept public templates from normal user', async () => {
    const response = await subscriberRequest.post('/templates').send(JSON.stringify(publicTemplateData))

    expect(response.status).toBe(403)
  })

  it('should serve public templates to normal users', async () => {
    const response = await subscriberRequest.get(`/templates/${publicTemplateId}`)

    expect(response.status).toBe(200)

    const data = JSON.parse(response.res.text)
    expect(data).toMatchObject(publicTemplateData)
  })

  it('should not serve public templates to unauthenticated users', async () => {
    const response = await publicRequest.get(`/templates/${publicTemplateId}`)

    expect(response.status).toBe(401)
  })

  it('should list the template for normal users', async () => {
    const response = await customerRequest.get('/templates')

    expect(response.status).toBe(200)

    const data = JSON.parse(response.res.text)
    expect(data).toBeInstanceOf(Array)
    expect(data.map(({_id}) => _id)).toContain(publicTemplateId)
  })

  it('should delete the public template', async () => {
    const response = await administratorRequest.delete(`/templates/${publicTemplateId}`)

    expect(response.status).toBe(200)

    const data = JSON.parse(response.res.text)
    expect(data.success).toBe(true)
  })
})

describe('template image life-cycle', () => {
  let mapId
  let imageId
  let templateImageMapData
  let templateId
  let templateData
  let templateImageId
  let publicTemplateData
  let publicTemplateId
  let publicTemplateImageId

  beforeAll(async () => {
    const imageMap = InfinityMap({userId})
    mapId = imageMap.mapId

    const dataStream = new PassThrough()
    dataStream.end(imageData)
    const image = await MapImage.write(
      {filename: 'test-file.jpg', metadata: {contentType: 'image/jpg', mapId, userId}},
      dataStream,
    )
    imageId = image._id

    templateImageMapData = {
      ...mapData,
      nodes: {
        ...mapData.nodes,
        rootId: {...mapData.nodes.rootId, children: ['childId', 'imageChildId']},
        imageChildId: {
          ...mapData.nodes.childId,
          id: 'imageChildId',
          image: imageId,
        },
      },
    }

    imageMap.set(templateImageMapData)

    await imageMap.save()
  })

  afterAll(async () => {
    await InfinityMap.deleteOne({mapId})
    await MapImage.deleteMany({_id: imageId})
  })

  it('should accept new templates from authenticated user', async () => {
    templateData = {
      ...templateImageMapData,
      name: 'image test template',
      keywords: ['test'],
      share: {public: false},
    }

    const response = await subscriberRequest.post('/templates').send(JSON.stringify(templateData))

    expect(response.status).toBe(200)

    const data = JSON.parse(response.res.text)
    expect(data.templateId).toBeDefined()

    templateId = data.templateId
  })

  it('should serve the template', async () => {
    const response = await subscriberRequest.get(`/templates/${templateId}`)

    expect(response.status).toBe(200)
    const data = JSON.parse(response.res.text)
    expect(data.keywords).toMatchObject(templateData.keywords)
    expect(data.share).toMatchObject(templateData.share)
    expect(data.name).toBe(templateData.name)
    expect(data.root).toBe(templateData.root)
    expect(data.nodes.rootId).not.toBe(templateData.nodes.rootId)
    expect(data.nodes.childId).not.toBe(templateData.nodes.childId)
    expect(data.nodes.imageChildId.image).not.toBe(templateData.nodes.imageChildId.image)

    templateImageId = data.nodes.imageChildId.image
  })

  it('should not serve the template to other users', async () => {
    const response = await customerRequest.get(`/templates/${templateId}`)

    expect(response.status).toBe(403)
  })

  it('should not serve the template to unauthenticated users', async () => {
    const response = await publicRequest.get(`/templates/${templateId}`)

    expect(response.status).toBe(401)
  })

  it('should serve a copied image of the original map', async () => {
    const response = await subscriberRequest.get(`/templates/${templateId}/images/${templateImageId}`)

    expect(response.status).toBe(200)
    expect(Buffer.from(response.body).equals(imageData)).toBe(true)
  })

  it('should accept new templates from authenticated user', async () => {
    publicTemplateData = {
      ...templateData,
      share: {public: true},
    }

    const response = await administratorRequest.post('/templates').send(JSON.stringify(publicTemplateData))

    expect(response.status).toBe(200)

    const data = JSON.parse(response.res.text)
    expect(data.templateId).toBeDefined()

    publicTemplateId = data.templateId
  })

  it('should serve images of public templates to other users', async () => {
    const response = await subscriberRequest.get(`/templates/${publicTemplateId}`)

    expect(response.status).toBe(200)
    const data = JSON.parse(response.res.text)
    expect(data.keywords).toMatchObject(publicTemplateData.keywords)
    expect(data.share).toMatchObject(publicTemplateData.share)
    expect(data.name).toBe(publicTemplateData.name)
    expect(data.root).toBe(publicTemplateData.root)
    expect(data.nodes.rootId).not.toBe(publicTemplateData.nodes.rootId)
    expect(data.nodes.childId).not.toBe(publicTemplateData.nodes.childId)
    expect(data.nodes.imageChildId.image).not.toBe(publicTemplateData.nodes.imageChildId.image)

    publicTemplateImageId = data.nodes.imageChildId.image
  })

  it('should serve a copied image of the original map', async () => {
    const response = await subscriberRequest.get(`/templates/${publicTemplateId}/images/${publicTemplateImageId}`)

    expect(response.status).toBe(200)
    expect(Buffer.from(response.body).equals(imageData)).toBe(true)
  })

  it('should not serve images to unauth users', async () => {
    const response = await publicRequest.get(`/templates/${publicTemplateId}/images/${publicTemplateImageId}`)

    expect(response.status).toBe(401)
  })

  // TODO: should serve images after deletion
})

describe('user life cycle', () => {
  const name = 'importtestuser'
  const mail = 'import1@example.com'
  const userData = {id: name, name, mail}
  const mail2 = 'import2@example.com'
  const userData2 = {id: name, name, mail: mail2}
  const otherUserData = {id: 'otherimporttestuser', name: 'otherimporttestuser', mail: 'other@example.com'}

  beforeAll(async () => {
    await User.deleteOne({name})
    await User.deleteOne({name: otherUserData.name})
  })

  it('should not allow normal users', async () => {
    const response = await administratorRequest.post('/sync/users').send(userData)

    expect(response.status).toBe(403)
  })

  it('should save new users in database', async () => {
    const response = await syncRequest.post('/sync/users').send(userData)

    expect(response.status).toBe(200)
    const data = JSON.parse(response.res.text)
    expect(data.success).toBe(true)

    const user = await User.findOne({name})

    expect(user).toBeTruthy()
    expect(user).toMatchObject(userData)
  })

  it('should update users in database', async () => {
    const response = await syncRequest.post('/sync/users').send(userData2)

    expect(response.status).toBe(200)
    const data = JSON.parse(response.res.text)
    expect(data.success).toBe(true)

    const user = await User.findOne({name})

    expect(user).toBeTruthy()
    expect(user).toMatchObject(userData2)
  })

  it('should fail on incomplete user data', async () => {
    const response = await syncRequest.post('/sync/users').send({name})

    expect(response.status).toBe(400)
  })

  it('should save many users', async () => {
    const response = await syncRequest.post('/sync/users').send([userData, otherUserData])

    expect(response.status).toBe(200)
    const data = JSON.parse(response.res.text)
    expect(data.success).toBe(true)

    const user = await User.findOne({name})
    expect(user).toBeTruthy()
    expect(user).toMatchObject(userData)

    const otherUser = await User.findOne({name: otherUserData.name})
    expect(otherUser).toBeTruthy()
    expect(otherUser).toMatchObject(otherUserData)
  })

  it('should fail on incomplete user data in array import', async () => {
    const response = await syncRequest.post('/sync/users').send([{name}, {mail: otherUserData.mail}])

    expect(response.status).toBe(400)
  })

  it('should find users by username', async () => {
    const response = await subscriberRequest.get('/users/search').query({query: name.substr(0, 5)})

    expect(response.status).toBe(200)
    const data = JSON.parse(response.res.text)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
  })

  it('should find users by mail address', async () => {
    const response = await subscriberRequest.get('/users/search/mail').query({query: mail})

    expect(response.status).toBe(200)
    const data = JSON.parse(response.res.text)
    expect(data.name).toBe(name)
    expect(data.id).toBe(name)
  })
})
