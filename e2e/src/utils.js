import {Browser, Builder, By, error, logging, until, WebDriver, WebElement} from 'selenium-webdriver'

const DEFAULT_TIMEOUT = 2000

/**
 *
 * @param by
 * @returns {function(WebDriver, string, number): WebElement}
 */
const createGetElement = (by: By = By.id) => async (
  driver: WebDriver,
  search,
  timeout = DEFAULT_TIMEOUT,
): WebElement => {
  const element = await driver.wait(until.elementLocated(by(search)), timeout)
  await driver.wait(until.elementIsVisible(element), timeout)
  return element
}

export const getElementById = createGetElement()

export const getElementByName = createGetElement(By.name)

export const getElementByXpath = createGetElement(By.xpath)

export const getElementByTagName = createGetElement(By.tagName)

export const getElementByCss = createGetElement(By.css)

export const login = async (driver: WebDriver, username, password) => {
  const form = await getElementByTagName(driver, 'form')
  await form.findElement(By.name('username')).sendKeys(username)
  await form.findElement(By.name('password')).sendKeys(password)

  await form.findElement(By.tagName('button')).click()

  // wait for the cookie to be set
  await driver.wait(async () => {
    try {
      await driver.manage().getCookie('auth')
      return true
    } catch (e) {
      if (e instanceof error.NoSuchCookieError) {
        return false
      }
      throw e
    }
  })
}

export const getErrorLogs = async (driver: WebDriver) => {
  const logs = await driver.manage().logs().get(logging.Type.BROWSER)

  return (
    logs
      // youtube plugin generates these errors that we cannot influence
      .filter(entry => !entry.message.includes("Failed to execute 'postMessage' on 'DOMWindow'"))
      .filter(entry => entry.level.value >= logging.Level.SEVERE.value || entry.message.includes('::ERROR'))
      .map(entry => entry.message)
  )
}

export const getErrorSnackbars = async (driver: WebDriver, timeout = 2000) => {
  try {
    await getElementByCss(driver, '.MuiSnackbarContent-root', timeout)
  } catch (e) {
    if (e instanceof error.TimeoutError) {
      return []
    }
    throw e
  }
  const snacks = await driver.findElements(By.css('.MuiSnackbarContent-root'))

  const classes = await Promise.all(snacks.map(sb => sb.getAttribute('class')))

  const elements = snacks.filter((el: WebElement, i) => classes[i].includes('SnackbarItem-variantError-'))

  return await Promise.all(elements.map(sb => sb.getText()))
}

export const createBuilder = (address, browser) => {
  const builder = new Builder().usingServer(address).forBrowser(browser)

  if (browser === Browser.CHROME) {
    const logPreferences = new logging.Preferences()
    logPreferences.setLevel(logging.Type.BROWSER, logging.Level.ALL)
    builder.setLoggingPrefs(logPreferences)
  }

  return builder
}

export const createDriver = async (builder: Builder) => {
  const driver = await builder.build()

  await driver.manage().window().maximize()

  return driver
}

export const cleanupDriver = async (driver: WebDriver) => {
  try {
    await driver.manage().deleteAllCookies()
    await driver.executeScript('localStorage.clear();')
  } catch (e) {
    // pass
  }
  await driver.quit()
}
