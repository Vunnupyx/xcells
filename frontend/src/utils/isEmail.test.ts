import isEmail from './isEmail'

const addresses = ['fantasy.name@awesome-it.de', 'test+subaddress@example.com', '123@infinitymaps.io']

const nonAddresses = ['http://test@example.com', 'test@example.com/']

describe('detect email addresses', () => {
  it(`should recognize all ${addresses.length} mail addresses`, () => {
    const failedUrls = addresses.filter((url: string) => !isEmail(url))

    expect(failedUrls).toHaveLength(0)
  })

  it(`should not recognize ant of the ${nonAddresses.length} entries as mail address`, () => {
    const wronglyUrls = nonAddresses.filter((url: string) => isEmail(url))

    expect(wronglyUrls).toHaveLength(0)
  })
})
