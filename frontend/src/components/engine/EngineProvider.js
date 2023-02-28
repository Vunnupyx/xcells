import React, {useEffect, useMemo, useState} from 'react'
import debug from 'debug'
import {useLocalStorage} from 'react-use'
import useMapStore from '../../hooks/useMapStore'
import PixiRenderEngine from '../../engine/PixiRenderEngine'
import RenderEngineInitFailedDialog from '../dialogs/RenderEngineInitFailedDialog'
import ProgressModal from '../ProgressModal'
import {isLocalHost} from '../../utils/browserDetection'
import NavigationHistory from './NavigationHistory'
import EngineOptionsContext from './EngineOptionsContext'
import EngineContext from './EngineContext'

const logError = debug('app:RenderEngine:Context').extend('ERROR*', '::')

const defaultOptions = {
  performanceMode: 'default',
  isAccessibilityEnabled: false,
  isPdfMetadataImportOptionEnabled: false,
}

// @refresh reset
const EngineProvider = ({children}) => {
  const store = useMapStore(false)
  const [engine, setEngine] = useState(null)
  const [error, setError] = useState(false)
  const [options, setOptions] = useLocalStorage('engineOptions', defaultOptions)

  useEffect(() => {
    try {
      const newEngine = new PixiRenderEngine(store, options)
      setEngine(newEngine)
      setError(false)
      if (process.env.NODE_ENV !== 'production' && isLocalHost) {
        window.engine = newEngine
      }
      return () => {
        setTimeout(() => newEngine.destroy(), 10000)
      }
    } catch (e) {
      setEngine(null)
      setError(true)
      logError('Could not create the render engine', e.message, e)
      if (process.env.NODE_ENV !== 'production') {
        throw e
      }
      return () => {}
    }
  }, [setEngine, store, options])

  const optionContext = useMemo(() => [options, setOptions], [options, setOptions])

  if (!engine && error) {
    return <RenderEngineInitFailedDialog open />
  }
  if (!engine && !error) {
    return <ProgressModal />
  }

  return (
    <EngineOptionsContext.Provider value={optionContext}>
      <NavigationHistory engine={engine} />
      <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>
    </EngineOptionsContext.Provider>
  )
}

export default EngineProvider
