import {createContext, React, useEffect, useMemo} from 'react'
import debug from 'debug'
import {useLocalStorage} from 'react-use'
import useInteractionManager from '../components/engine/useInteractionManager'

const log = debug('app:context:devMode')

const LOG_LEVEL_DEBUG = 'app:*'
const LOG_LEVEL_DEFAULT = 'app:*::ERROR*'
const LOG_LEVEL_FLOOD = 'app:*::FLOOD'
const LOG_LEVEL_PERFORMANCE = 'app:*::PERFORMANCE'

// remove old logging settings, if they are present
if (['app:*,-app:*::FLOOD', 'app:*::ERROR*'].includes(localStorage.getItem('debug'))) {
  localStorage.removeItem('debug')
}

export const DevModeContext = createContext()

/**
 * Creates a context provider for dev mode.
 * Holds information about what is shown.
 *
 * @param children
 * @returns {JSX.Element}
 */
export const DevModeProvider = ({children}) => {
  // Log level
  const [debugSetting] = useLocalStorage('debug', LOG_LEVEL_DEFAULT)
  const [debugLogsActive, setDebugLogsActive] = useLocalStorage('debugLogsActive', false)
  const [floodLogsActive, setFloodLogsActive] = useLocalStorage('floodLogsActive', false)
  const [performanceLogsActive, setPerformanceLogsActive] = useLocalStorage('performanceLogsActive', false)

  useEffect(() => {
    const logLevel = [
      debugSetting,
      debugLogsActive && LOG_LEVEL_DEBUG,
      floodLogsActive ? LOG_LEVEL_FLOOD : `-${LOG_LEVEL_FLOOD}`,
      performanceLogsActive ? LOG_LEVEL_PERFORMANCE : `-${LOG_LEVEL_PERFORMANCE}`,
    ]
      .filter(Boolean)
      .join(',')

    log('setting log level', logLevel)

    debug.enable(logLevel)
  }, [debugSetting, debugLogsActive, floodLogsActive, performanceLogsActive])

  // Map Stats
  const [mapStatsVisible, setMapStatsVisible] = useLocalStorage('mapStatsVisible', false)

  // FPS Counter
  const [fpsCounterVisible, setFpsCounterVisible] = useLocalStorage('fpsCounterVisible', false)

  // System information
  const [systemInformationVisible, setSystemInformationVisible] = useLocalStorage('systemInformationVisible', false)

  // Ticker stop disable
  const {setState} = useInteractionManager(false)
  const [fpsTickerRun, setFpsTickerRun] = useLocalStorage('fpsTickerRun', false)

  useEffect(() => {
    setState({tickerStop: !fpsTickerRun})
  }, [fpsTickerRun, setState])

  // Node jump visible
  const [nodeJumpVisible, setNodeJumpVisible] = useLocalStorage('nodeJumpVisible', false)

  // Node jump visible
  const [circleBenchmarkVisible, setCircleBenchmarkVisible] = useLocalStorage('circleBenchmarkVisible', false)

  const [showMetrics, setShowMetrics] = useLocalStorage('showMetrics', false)

  const value = useMemo(
    () => ({
      debugLogsActive,
      setDebugLogsActive,
      floodLogsActive,
      setFloodLogsActive,
      performanceLogsActive,
      setPerformanceLogsActive,
      mapStatsVisible,
      setMapStatsVisible,
      fpsCounterVisible,
      setFpsCounterVisible,
      systemInformationVisible,
      setSystemInformationVisible,
      fpsTickerRun,
      setFpsTickerRun,
      nodeJumpVisible,
      setNodeJumpVisible,
      circleBenchmarkVisible,
      setCircleBenchmarkVisible,
      showMetrics,
      setShowMetrics,
    }),
    [
      debugLogsActive,
      setDebugLogsActive,
      floodLogsActive,
      setFloodLogsActive,
      performanceLogsActive,
      setPerformanceLogsActive,
      mapStatsVisible,
      setMapStatsVisible,
      fpsCounterVisible,
      setFpsCounterVisible,
      systemInformationVisible,
      setSystemInformationVisible,
      fpsTickerRun,
      setFpsTickerRun,
      nodeJumpVisible,
      setNodeJumpVisible,
      circleBenchmarkVisible,
      setCircleBenchmarkVisible,
      showMetrics,
      setShowMetrics,
    ],
  )

  return <DevModeContext.Provider value={value}>{children}</DevModeContext.Provider>
}
