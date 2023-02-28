import cartesianProduct from './cartesianProduct'
import isUrl from './isUrl'

const protocol = ['www.', 'http://', 'https://', 'ftp://']
const hosts = ['google.de', 'infinitymaps.io', 'example.com', 'domain.co.uk', 'exotic.events']
const ports = ['', ':8080', ':27017']
const paths = [
  '',
  '/',
  '/this/is/a/deep/path',
  '/utf8/path/äüöß',
  '/urlencoded/path%2F%20%23%24%25',
  '/index.html',
  '/image.png',
  '/favicon.ico',
]
const params = ['', '?debug', '?param[0]=true', '?urlencode%2F%20%23%24%25=false']
const anchors = ['', '#anchor', '#achnor-with-dashes', '#urlencode%2F%20%23%24%25', '#utf8äüöß']

const urls = cartesianProduct(protocol, hosts, ports, paths, params, anchors).map((parts: string[]) => parts.join(''))

// test urls from trello ticket
urls.push(
  'https://app.asana.com/0/1190481060760017/list',
  'https://beta.infinitymaps.io/maps/qH7fdtfp8JJ/mhQTQrTmQ8f',
  'https://www.spiegel.de/netzwelt/web/coronavirus-tech-konzerne-gehen-gegen-von-donald-trump-geteilte-videos-vor-a-9a06fd39-6d10-49f0-b3bd-1da87357f358?xing_share=news#ref=rss',
  'spiegel.de',
  'https://trello.com/c/S77RCp0n/639-user-avatars-from-wp-für-home-screen',
  'https://trello.com/b/6dL3txTs/∞-bugs',
  'https://owa.kit.edu/owa/auth/logon.aspx?replaceCurrent=1&url=https%3a%2f%2fowa.kit.edu%2fowa%2f',
  'https://test.sharepoint.com/:x:/r/sites/layouts/15/Doc.aspx?sourcedoc=%7BE89D3615-9B78-4204-A7F3-0A04A71F60EB%7D&file=Ersatz%20alter%20oder%20defekter%20Headsets.xlsx&action=default&mobileredirect=true&DefaultItemOpen=1&ct=1621497356922&wdOrigin=OFFICECOM-WEB.MAIN.OTHER&cid=83ef651b-66a6-43f3-83ac-e0bf54761cb8',
  'https://blog.leanstack.com/@ashmaurya',
  'HTTP://domain.com',
  // .tld isn't a valid TLD
  // 'www.fantasiedomäne.tld',
  'https://medium.com/@razgo/desirability-feasibility-viability-sustainable-innovation-what-do-we-miss-aeeefef598d9',
  'evernote:///view/514605/s4/d7ae697d-f08c-4162-ad87-d6a70258c003/d7ae697d-f08c-4162-ad87-d6a70258c003/',
  'tel:0190666666',
  'git+ssh://github.com/test/test',
  'ssh://user@192.168.11.0',
)

const nonUrls = [
  '',
  '123.4',
  'Satzende.Anf',
  '1.1.1970',
  '1.234,67',
  'test@lala.de',
  'title: this is a test',
  'StaticClass::Member',
  'static::class::member',
  'upload.pdf',
  'upload.docx',
]

describe('should handle strings as urls', () => {
  it(`should recognize all ${urls.length} urls`, () => {
    const failedUrls = urls.filter((url: string) => !isUrl(url))

    expect(failedUrls).toHaveLength(0)
  })

  it('should not recognize as url', () => {
    const wronglyUrls = nonUrls.filter((url: string) => isUrl(url))

    expect(wronglyUrls).toHaveLength(0)
  })
})
