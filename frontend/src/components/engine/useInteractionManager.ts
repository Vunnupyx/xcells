import {useEffect, useState} from 'react'
import useEngine from './useEngine'

import type EventManager from '../../engine/events/EventManager'

const useInteractionManager = (isWithSubscription = true): EventManager => {
  const {eventManager} = useEngine(false)
  const [, forceRerender] = useState({})

  const {subscribe, unsubscribe} = eventManager

  useEffect(() => {
    if (isWithSubscription) {
      const subscription = () => forceRerender({})

      subscribe(subscription)
      return () => unsubscribe(subscription)
    }
    return () => undefined
  }, [isWithSubscription, subscribe, unsubscribe])

  return eventManager
}

export default useInteractionManager
