// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line no-use-before-define
import React from 'react'
import {IntlProvider} from 'react-intl'
import {act} from 'react-dom/test-utils'
import {fireEvent, render, screen, within} from '@testing-library/react'
import {SnackbarKey} from 'notistack'
import * as UseSnackbar from '../../hooks/useSnackbar'
import ShareMapWithDialog from './ShareMapWithDialog'
import messages from '../../intl'
import {ApiContext} from '../../contexts/api'

describe('ShareMapWithDialog', () => {
  const snackbarMock = {
    success: (...args) => 'some' as SnackbarKey,
    error: (...args) => 'some' as SnackbarKey,
    warning: (...args) => 'some' as SnackbarKey,
    info: (...args) => 'some' as SnackbarKey,
    enqueueSnackbar: (...args) => 'some' as SnackbarKey,
    closeSnackbar: (...args) => {
      // Do nothing
    },
  }

  describe('From new user trying to share a map', () => {
    let closed = false
    beforeEach(() => {
      jest.spyOn(UseSnackbar, 'default').mockImplementation(() => snackbarMock)

      let shareStorage: unknown = []
      const apiMock = {
        get: async (path, options) => {
          switch (path) {
            case '/maps/abc123/share/access':
              return shareStorage
            case '/users/search?query=12':
              return []
            case '/users/search?query=1234':
              return []
            case '/users/search?query=test':
              return [
                {_id: '617ee4a4b332dcc6b298232c', id: 'testOne', name: 'testOne'},
                {_id: '617ee4d7af27a8c6fcd74a5a', id: 'testTwo', name: 'testTwo'},
              ]
            case '/users/search/mail?query=ab%40cd.com':
              return {_id: 'aaaaaaaaaaaaaaaaaaaaaaaa', id: 'testThree', name: 'testThree'}
            case '/users/testThree':
              return {_id: 'aaaaaaaaaaaaaaaaaaaaaaaa', name: 'testThree'}
            default:
              return {}
          }
        },
        post: async (path, options) => {
          switch (path) {
            case '/maps/abc123/share/access':
              shareStorage = [{subjectId: 'testThree', subjectType: 'user', role: 'contributor'}]
              expect(options.body).toEqual(shareStorage)
              return {success: true}
            default:
              return {}
          }
        },
        put: async (...args) => null,
        patch: async (...args) => null,
        delete: async (...args) => null,
        request: async (...args) => null,
      }

      render(
        <ApiContext.Provider value={apiMock}>
          <IntlProvider locale="en" messages={messages.en}>
            <ShareMapWithDialog
              mapId="abc123"
              open
              onClose={() => {
                closed = true
              }}
            />
          </IntlProvider>
        </ApiContext.Provider>,
      )
    })

    it('should render share dialog', () => {
      screen.getByRole('dialog', {name: 'Share a map with another user'})
      screen.getByRole('heading', {name: 'Share a map with another user', level: 6})
    })

    it('should warn about input, that is less than 3 characters', () => {
      // Validation of too short
      fireEvent.change(screen.getByRole('searchbox'), {target: {value: '12'}})
      expect(screen.getByTestId('warn-input-label-limit').style.color).toEqual('red')

      // No more warning
      fireEvent.change(screen.getByRole('searchbox'), {target: {value: '1234'}})
      expect(screen.queryByTestId('warn-input-label-limit')).toBeNull()
    })

    it('should show suggested user names by input', async () => {
      // No suggestions yet
      expect(screen.queryByRole('option', {name: 'testTwo'})).toBeNull()

      // Entering into search box
      fireEvent.change(screen.getByRole('searchbox'), {target: {value: 'test'}})

      // Seeing drop down
      await screen.findByRole('option', {name: 'testOne'})
      expect(screen.queryByRole('option', {name: 'testTwo'})).not.toBeNull()
      expect(screen.queryAllByRole('option')).toHaveLength(2)
    })

    it('should show suggestions by e-mail', async () => {
      // No suggestions yet
      expect(screen.queryByRole('option', {name: 'ab@cd.com'})).toBeNull()
      expect(closed).toBe(false)

      // Entering in search box
      fireEvent.change(screen.getByRole('searchbox'), {target: {value: 'ab@cd.com'}})
      const option = await screen.findByRole('option', {name: 'ab@cd.com'})
      expect(screen.queryAllByRole('option')).toHaveLength(1)

      // Picking suggestion
      fireEvent.click(option)
      await act(() => Promise.resolve())

      // List of users and permissions
      await screen.findByText('@testThree')
      screen.getByRole('button', {name: 'Mapper'})
      screen.getByRole('button', {name: 'delete'})

      // Click apply
      const applyButton = screen.getByRole('button', {name: 'Apply'})
      fireEvent.click(applyButton)
      await act(() => Promise.resolve())

      // Input field should be empty and ready for new search
      const searchBox = screen.getByRole('searchbox')
      expect((searchBox as HTMLInputElement).value).toEqual('')

      // This should just close the window
      expect(closed).toBe(true)
    })
  })

  describe('From existing having map shared', () => {
    beforeEach(() => {
      jest.spyOn(UseSnackbar, 'default').mockImplementation(() => snackbarMock)

      const apiMock = {
        get: async (path, options) => {
          switch (path) {
            case '/maps/abc321/share/access':
              return [
                {subjectId: 'testFour', subjectType: 'user', role: 'contributor'},
                {subjectId: 'testFive', subjectType: 'user', role: 'contributor'},
              ]
            case '/users/testFour':
              return {_id: '617ee4d7af24444444444444', name: 'testFour'}
            case '/users/testFive':
              return {_id: '617ee4d7af25555555555555', name: 'testFive'}
            default:
              return {}
          }
        },
        post: async (path, options) => null,
        put: async (...args) => null,
        patch: async (...args) => null,
        delete: async (...args) => null,
        request: async (...args) => null,
      }

      render(
        <ApiContext.Provider value={apiMock}>
          <IntlProvider locale="en" messages={messages.en}>
            <ShareMapWithDialog mapId="abc321" open onClose={() => false} />
          </IntlProvider>
        </ApiContext.Provider>,
      )
    })

    it('should display list of existing shares', () => {
      // Two users are displayed
      screen.getByText('@testFour')
      screen.getByText('@testFive')

      // Each have button to change collaboration role
      const collaborationType = screen.getAllByRole('button', {name: 'Mapper'})
      expect(collaborationType).toHaveLength(2)

      // Each user have button to remove permissions from collaboration
      const removeButton = screen.getAllByRole('button', {name: 'delete'})
      expect(removeButton).toHaveLength(2)
    })

    it('should provide description about access types', async () => {
      // No popup yet
      expect(screen.queryByRole('heading', {name: 'Access Rights Of Roles'})).toBeNull()
      const infoIcon = screen.getByTestId('info-icon')

      // Clicking on info icon
      fireEvent.click(infoIcon)
      await act(() => Promise.resolve())

      // There should be popup visible
      const popup = screen.getByRole('presentation')
      within(popup).getByRole('heading', {name: 'Access Rights Of Roles'})
      within(popup).getByText('Owner')
      within(popup).getByText('Mapper')
      within(popup).getByText('Reader')
    })
  })

  describe('From new user trying to understand the UI', () => {
    beforeEach(() => {
      jest.spyOn(UseSnackbar, 'default').mockImplementation(() => snackbarMock)

      const apiMock = {
        get: async (path, options) => {
          switch (path) {
            case '/maps/abc456/share/access':
              return []
            case '/users/search?query=ab':
              return []
            case '/users/search?query=abc':
              return []
            case '/users/search/mail?query=abc%40de.com':
              return []
            case '/users/search/mail?query=abcde%40fg.com':
              return []
            case '/users/search?query=testSix':
              return [{_id: '666666666666666666666666', id: 'testSix', name: 'testSix'}]
            case '/users/testSix':
              return {_id: '666666666666666666666666', name: 'testSix'}
            case '/users/search/mail?query=sev%40en.com':
              return {_id: '777777777777777777777777', id: 'testSeven', name: 'testSeven'}
            case '/users/testSeven':
              return {_id: '666666666666666666666666', name: 'testSeven'}
            default:
              return {}
          }
        },
        post: async (path, options) => null,
        put: async (...args) => null,
        patch: async (...args) => null,
        delete: async (...args) => null,
        request: async (...args) => null,
      }

      render(
        <ApiContext.Provider value={apiMock}>
          <IntlProvider locale="en" messages={messages.en}>
            <ShareMapWithDialog mapId="abc456" open onClose={() => false} />
          </IntlProvider>
        </ApiContext.Provider>,
      )
    })

    it('should give textual feedback for bad input', async () => {
      // No warnings when no action
      screen.getByRole('button', {name: 'Apply'})
      expect(screen.queryAllByRole('alert')).toEqual([])

      // Show warning and hide apply button, when search string too short
      fireEvent.change(screen.getByRole('searchbox'), {target: {value: 'ab'}})
      expect(screen.queryAllByRole('button', {name: 'Apply'})).toEqual([])
      expect(screen.getByRole('alert').innerHTML).toContain('Use longer search terms')

      // Show warning and hide apply button, when no user is found
      fireEvent.change(screen.getByRole('searchbox'), {target: {value: 'abc'}})
      expect(screen.queryAllByRole('button', {name: 'Apply'})).toEqual([])
      expect(screen.getByRole('alert').innerHTML).toContain('User not found, try different name')

      // Show warning and hide apply button, when e-mail is in progress
      fireEvent.change(screen.getByRole('searchbox'), {target: {value: 'abc@'}})
      expect(screen.queryAllByRole('button', {name: 'Apply'})).toEqual([])
      const alert1 = screen.getByRole('alert')
      expect(alert1.innerHTML).toContain('No user by e-mail yet, please provide existing e-mail or')
      within(alert1).getByRole('link', {name: 'invite to signup'})

      // Show warning and hide apply button, when no user by e-mail is found
      fireEvent.change(screen.getByRole('searchbox'), {target: {value: 'abc@de.com'}})
      expect(screen.queryAllByRole('button', {name: 'Apply'})).toEqual([])
      const alert2 = screen.getByRole('alert')
      expect(alert2.innerHTML).toContain('No user by e-mail, try different one or')
      within(alert2).getByRole('link', {name: 'invite to signup'})

      // Hide warning and show apply button, when found by user name
      fireEvent.change(screen.getByRole('searchbox'), {target: {value: 'testSix'}})
      await screen.findByRole('option', {name: 'testSix'})
      screen.getByRole('button', {name: 'Apply'})
      expect(screen.queryAllByRole('alert')).toEqual([])

      // Hide warning and show apply button, when found by e-mail
      fireEvent.change(screen.getByRole('searchbox'), {target: {value: 'sev@en.com'}})
      const option = await screen.findByRole('option', {name: 'sev@en.com'})
      screen.getByRole('button', {name: 'Apply'})
      expect(screen.queryAllByRole('alert')).toEqual([])

      // Still hide warning and show apply button, when clicked on drop-down list
      fireEvent.click(option)
      await act(() => Promise.resolve())
      screen.getByRole('button', {name: 'Apply'})
      expect(screen.queryAllByRole('alert')).toEqual([])
    })

    it('should help inviting via e-mail', async () => {
      // No warnings when no action
      fireEvent.change(screen.getByRole('searchbox'), {target: {value: 'abcde@fg.com'}})
      const alert = screen.getByRole('alert')
      const link = within(alert).getByRole('link', {name: 'invite to signup'})

      // Open invite form in a separate window
      expect((link as HTMLAnchorElement).href).toEqual('https://infinitymaps.io/en/invite-friends/')
      expect((link as HTMLAnchorElement).target).toEqual('_blank') // Open in new window
      fireEvent.click(link)

      // Old input field should remain with e-mail
      const searchBox = screen.getByRole('searchbox')
      expect((searchBox as HTMLInputElement).value).toEqual('abcde@fg.com')
    })
  })
})
