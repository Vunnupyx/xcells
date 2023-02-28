import debug from 'debug'
import {EventEmitter} from 'eventemitter3'

import runAsync from '../utils/runAsync'

const logError = debug('app:lib:Publisher').extend('ERROR*', '::')

/**
 * Plugin to allow subscribing to changes in the object. Can be used in React components to trigger a
 * rerender or to update other components
 */
class Publisher<EventTypes extends string = string> extends EventEmitter<EventTypes> {
  subscriptions: Set<(o?: this) => void> = new Set()

  firePromise: Promise<unknown[]> | null = null

  /**
   * subscribe to the object. Everytime the object fires "fireSubscription" the given function will receive
   * the object itself. Returns a function to unsubscribe.
   *
   * @param fn function hat will receive the object on changes
   * @returns {function(): void}
   */
  subscribe = (fn: (o?: this) => void): (() => void) => {
    const {subscriptions} = this
    subscriptions.add(fn)

    this.publishTo(fn)

    return () => this.unsubscribe(fn)
  }

  /**
   * unsubscribe from the object. Cancels previous subscriptions. Does not fail, if already unsubscribed.
   * @param fn subscription function given to subscribe
   */
  unsubscribe = (fn: (o?: this) => void): void => {
    const {subscriptions} = this
    if (subscriptions.has(fn)) {
      subscriptions.delete(fn)
    }
  }

  private publishTo(fn: (o?: this) => void): Promise<unknown> | unknown {
    try {
      return fn(this)
    } catch (e) {
      logError(`Could not execute subscriber: ${(e as Error).message}`, (e as Error).stack)
      return Promise.resolve(null)
    }
  }

  /**
   * inform all subscribers that a change happend. This will occur asynchronously so that this can be fired on
   * every change and subscribers will only be informed after the current cycle.
   * @returns {Promise<any>}
   */
  fireSubscriptions = (): Promise<unknown[]> => {
    const {subscriptions} = this

    if (!this.firePromise) {
      this.firePromise = runAsync(async () => {
        this.firePromise = null
        return Promise.all([...subscriptions].map(fn => runAsync(() => this.publishTo(fn))))
      })
    }

    return this.firePromise
  }

  /**
   * clear all subscribers to avoid memory leaks when publisher is destroyed
   */
  destroy(): void {
    const {subscriptions} = this
    subscriptions.clear()
  }
}

export default Publisher
