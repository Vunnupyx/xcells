import {useContext, useEffect, useState} from 'react'

import {MapStoreContext} from '../contexts/mapStore'

const useMapStore = (isWithSubscription = true) => {
  const store = useContext(MapStoreContext)
  const [, setRender] = useState(true)

  useEffect(() => {
    if (isWithSubscription) {
      const subscription = () => setRender({})

      store.subscribe(subscription)
      return () => {
        store.unsubscribe(subscription)
      }
    }
    return () => undefined
  }, [isWithSubscription, store])

  return store
}

export default useMapStore
