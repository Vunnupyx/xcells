import {externalWarning} from './AppNotifications'

describe('App Notifications component', () => {
  const dispatchedEvents = []
  const targetMock = {
    dispatchEvent(event: Event): boolean {
      dispatchedEvents.push(event)
      return true
    },
  }

  it('should wrap sending of warning event', () => {
    externalWarning('some.id', targetMock)

    expect(dispatchedEvents).toHaveLength(1)
    expect(dispatchedEvents[0].type).toEqual('app-warning')
    expect(dispatchedEvents[0].bubbles).toBeTruthy()
    expect(dispatchedEvents[0].detail).toEqual({translationId: 'some.id'})
  })
})
