import {Browser, By, until} from 'selenium-webdriver'

import {
  cleanupDriver,
  createBuilder,
  createDriver,
  getElementByCss,
  getErrorLogs,
  getErrorSnackbars,
  login,
} from './utils'

// this is a docker ip that is reachable from within a docker container and should work with the normal dev setup
const DEFAULT_HOST = '172.17.0.1'

const {
  BROWSER_NAME = Browser.CHROME,
  SELENIUM_HUB_ADDRESS = `http://${DEFAULT_HOST}:4444/wd/hub`,
  TARGET_URL = `http://${DEFAULT_HOST}:3000`,
  USERNAME = 'admin',
  PASSWORD = 'admin',
  /** default waiting time for backend is 10000
   * @see backend/src/constants
   */
  SAVE_TO_DATABASE_INTERVAL = 10000,
} = process.env

// remove trailing slash if necessary
const targetUrl = TARGET_URL.endsWith('/') ? TARGET_URL.slice(0, -1) : TARGET_URL
const url = path => `${targetUrl}${path}`

jest.setTimeout(20000)

const publicPaths = ['/login', '/maps', '/maps/tutorials', '/404']

const userPaths = ['/maps/public', '/maps/tutorials', '/maps/admin/errors', '/maps/upload']

const checkForErrors = async driver => {
  expect(await getErrorSnackbars(driver)).toHaveLength(0)
  expect(await getErrorLogs(driver)).toHaveLength(0)
}

const loadFirstMap = async (driver, path = '/maps') => {
  await driver.get(url(path))

  const firstMapButton = await getElementByCss(driver, 'main button[class*="makeStyles-cardActionArea-"]')

  expect(firstMapButton).toBeDefined()

  await firstMapButton.click()

  // allow the route to change and the progress spinner to show
  await driver.sleep(100)

  const spinner = driver.findElement(By.css('.progressSpinner'))

  if (spinner) {
    await driver.wait(until.stalenessOf(spinner), 60000)
  }
  // allow the render engine to render
  await driver.sleep(2000)
}

const builder = createBuilder(SELENIUM_HUB_ADDRESS, BROWSER_NAME)

describe('render pages and check for error logs and error snackbars', () => {
  let driver

  beforeEach(async () => {
    driver = await createDriver(builder)
  })

  afterEach(() => cleanupDriver(driver))

  publicPaths.forEach(path => {
    it(`should render public page with path ${path}`, async () => {
      await driver.get(url(path))
      await checkForErrors(driver)
    })
  })

  it('should login', async () => {
    await driver.get(url('/login'))
    await login(driver, USERNAME, PASSWORD)
    await checkForErrors(driver)
  })

  userPaths.forEach(path => {
    it(`should render user page with path ${path}`, async () => {
      await driver.get(url('/login'))
      await login(driver, USERNAME, PASSWORD)
      await driver.get(url(path))
      await checkForErrors(driver)
    })
  })
})

describe('render engine starts without errors', () => {
  let driver

  beforeEach(async () => {
    driver = await createDriver(builder)
  })

  afterEach(() => cleanupDriver(driver))

  it('should create a new map', async () => {
    await driver.get(url('/login'))
    await login(driver, USERNAME, PASSWORD)
    await driver.get(url('/maps/new'))
    await checkForErrors(driver)

    // wait for the map to be saved to the database
    await driver.get(url('/maps'))
    await driver.sleep(SAVE_TO_DATABASE_INTERVAL + 1000)
  }, 30000)

  it('should render the last edited map from the canvas in read only mode', async () => {
    await loadFirstMap(driver)

    await checkForErrors(driver)
  }, 60000)

  it('should render the last edited map from the canvas in write mode', async () => {
    await driver.get(url('/login'))
    await login(driver, USERNAME, PASSWORD)

    await loadFirstMap(driver)

    await checkForErrors(driver)
  }, 60000)
})
