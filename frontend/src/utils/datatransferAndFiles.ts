import {api} from '../hooks/useApi'

type FileType = 'image' | 'file'
const FILE_TYPES = {
  image: 'image' as FileType,
  file: 'file' as FileType,
}

export type ImageDims = {height: number; width: number}

export const getDimsOfImageFile = async (file: File): Promise<ImageDims> => {
  const promise = new Promise((resolve: (dims: ImageDims) => void) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        height: img.height,
        width: img.width,
      })
    }
    img.src = URL.createObjectURL(file)
  })
  return promise
}

export const getTextFromDataTransfer = (dataTransfer: DataTransfer): string => {
  return dataTransfer.getData('text/plain')
}

export type UploadResult = {
  file: File
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiAnswer: any
  fileType: FileType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const upload = async (file: File, mapId: string, onMessage: (id: string) => void): Promise<UploadResult> => {
  const isHeic = /.*\.(hei(c|f)|HEI(C|F))/g.test(file.name)
  if (isHeic) {
    onMessage('mapUploadErrorHeic')
  }

  const {type = 'application/octet-stream'} = file
  if (type && type.startsWith('image/') && !isHeic) {
    const {width, height} = await getDimsOfImageFile(file)
    const apiAnswer = await api.post(`/maps/${mapId}/images`, {
      body: file,
      params: {filename: file.name},
    })
    return {
      file,
      apiAnswer,
      fileType: FILE_TYPES.image,
      metadata: {
        width,
        height,
      },
    }
  }

  const apiAnswer = await api.post(`/maps/${mapId}/files`, {
    body: file,
    params: {filename: file.name},
  })
  return {
    file,
    apiAnswer,
    fileType: FILE_TYPES.file,
    metadata: {},
  }
}
