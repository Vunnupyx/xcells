import {useContext, useEffect, useState} from 'react'
import EngineContext from './EngineContext'
import type PixiRenderEngine from '../../engine/PixiRenderEngine'

const useEngine = (isWithSubscription = true): PixiRenderEngine => {
  const engine = useContext(EngineContext)
  const [, forceRerender] = useState({})

  const {subscribe, unsubscribe} = engine

  useEffect(() => {
    if (isWithSubscription) {
      const subscription = () => forceRerender({})

      subscribe(subscription)
      return () => unsubscribe(subscription)
    }
    return () => undefined
  }, [isWithSubscription, subscribe, unsubscribe])

  return engine
}

export default useEngine
