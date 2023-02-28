import React, {useEffect, useRef, useState} from 'react'
import {FormattedMessage} from 'react-intl'
import {useHistory, useParams} from 'react-router-dom'
import {useLocalStorage} from 'react-use'

import makeStyles from '@material-ui/styles/makeStyles'

import useEngine from '../../engine/useEngine'
import {NodeJumpOptions} from './DevModeNodeJump'
import {watchLastAnimationFps} from './DevModeFps'
import {useDevModeContext} from '../../../hooks/useDevMode'
import {
  CIRCLE_BENCHMARK_END_NODE,
  CIRCLE_BENCHMARK_ITERATIONS,
  CIRCLE_BENCHMARK_START_NODE,
} from '../../../utils/urlFlags'

const FPS_MEASURE_EVENT = 'benchmark-new-FPS'
const BENCHMARK_END_EVENT = 'benchmark-end'
const START_NODE_STORAGE_PREFIX = 'devmode_nodejump_startnode'
const END_NODE_STORAGE_PREFIX = 'devmode_nodejump_endnode'
const ITERATIONS_STORAGE_PREFIX = 'devmode_nodejump_iterations'

const everyNth = (arr, nth) => arr.filter((e, i) => i % nth === nth - 1)
const reducer = (accumulator, curr) => accumulator + curr

const useStyles = makeStyles({
  warning: {
    color: 'red',
  },
  title: {
    fontWeight: 'bold',
  },
  numberInput: {
    width: '50%',
  },
})

const runCircles = (engine, startNodeId, endNodeId, iterations) => {
  const {viewport, manager} = engine

  const nextCircle = iterationsLeft => {
    const nextIteration = () => {
      if (iterationsLeft <= 1) {
        viewport.emit(BENCHMARK_END_EVENT)
        return
      }
      nextCircle(iterationsLeft - 1)
    }

    const moveBack = () => {
      viewport.once(FPS_MEASURE_EVENT, () => nextIteration())
      manager.zoomToNode(endNodeId)
    }

    viewport.once(FPS_MEASURE_EVENT, () => moveBack())
    manager.zoomToNode(startNodeId)
  }
  manager.zoomToNode(endNodeId)
  viewport.once(FPS_MEASURE_EVENT, () => nextCircle(iterations))
}

const CircleBenchmark = () => {
  const classes = useStyles()
  const {mapId} = useParams()
  const history = useHistory()
  const {circleBenchmarkVisible} = useDevModeContext()

  const {
    [CIRCLE_BENCHMARK_START_NODE]: startNodeParam,
    [CIRCLE_BENCHMARK_END_NODE]: endNodeParam,
    [CIRCLE_BENCHMARK_ITERATIONS]: iterationsParam,
  } = useParams()

  const automode = Boolean(startNodeParam && endNodeParam && iterationsParam)

  const engine = useEngine(false)
  const {viewport} = engine

  const [startNode, setStartNode] = useState(startNodeParam || '')
  const [endNode, setEndNode] = useState(endNodeParam || '')

  const [iterations, setIterations] = useLocalStorage(
    `${ITERATIONS_STORAGE_PREFIX}_${mapId}`,
    parseInt(iterationsParam, 10) || 5,
  )

  const fpsList = useRef([]).current
  const [allFps, setAllFps] = useState('-')
  const [toStartFps, setToStartFps] = useState('-')
  const [toEndFps, setToEndFps] = useState('-')

  const [runningBenchmark, setRunningBenchmark] = useState(false)

  // store iterations before starting benchmark
  const [currentIterations, setCurrentIterations] = useState(0)

  const [innerSize, setInnerSize] = useState({x: 0, y: 0})

  watchLastAnimationFps(fps => {
    fpsList.push(fps)
  }, FPS_MEASURE_EVENT)

  const evaluateBenchmark = () => {
    const neededFps = fpsList.splice(-2 * currentIterations)
    const newAllFps = Math.round(neededFps.reduce(reducer) / (currentIterations * 2))
    setAllFps(newAllFps)

    const toEndFpsList = everyNth(neededFps, 2)
    const newToEndFps = Math.round(toEndFpsList.reduce(reducer) / currentIterations)
    setToEndFps(newToEndFps)

    const toStartFpsList = [neededFps[0]].concat(everyNth(neededFps.splice(1), 2))
    const newToStartFps = Math.round(toStartFpsList.reduce(reducer) / currentIterations)
    setToStartFps(newToStartFps)

    setRunningBenchmark(false)

    if (automode) {
      history.push({
        pathname: '/benchmarkResult',
        // eslint-disable-next-line object-shorthand
        state: {everything: newAllFps, toStartOnly: newToStartFps, toEndOnly: newToEndFps},
      })
    }
  }

  const startButtonClick = () => {
    setRunningBenchmark(true)
    fpsList.length = 0
    setCurrentIterations(iterations)
    runCircles(engine, startNode, endNode, iterations)
  }

  const saveButtonClick = () => {
    setIterations(iterations)
  }

  const numberInputChange = e => {
    let {value} = e.target
    if (value < 1) value = 1
    setIterations(value)
  }

  useEffect(() => {
    viewport.on(BENCHMARK_END_EVENT, evaluateBenchmark)
    return () => {
      viewport.off(BENCHMARK_END_EVENT, evaluateBenchmark)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport, fpsList, currentIterations])

  useEffect(() => {
    const refresh_app_size = () => {
      setInnerSize({x: window.innerWidth, y: window.innerHeight})
    }
    refresh_app_size()
    window.addEventListener('resize', refresh_app_size)
    return () => {
      window.removeEventListener('resize', refresh_app_size)
    }
  }, [setInnerSize])

  // needs to be done this way for making it work in guest mode
  useEffect(() => {
    if (automode) startButtonClick()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!circleBenchmarkVisible) return null

  return (
    <div>
      <p className={classes.title}>
        <FormattedMessage id="devModeBenchmarkCircleBenchmark" />
      </p>
      <p className={classes.warning}>
        <FormattedMessage id="devModeBenchmarkChromiumOnly" />
      </p>
      <p />
      <div>
        <FormattedMessage id="devModeBenchmarkStartNode" />
        &#58;
      </div>
      <NodeJumpOptions jumpNode={startNode} setJumpNode={setStartNode} storagePrefix={START_NODE_STORAGE_PREFIX} />
      <div>
        <FormattedMessage id="devModeBenchmarkEndNode" />
        &#58;
      </div>
      <NodeJumpOptions jumpNode={endNode} setJumpNode={setEndNode} storagePrefix={END_NODE_STORAGE_PREFIX} />
      <p />
      <input type="number" value={iterations} onInput={numberInputChange} className={classes.numberInput} />
      <br />
      <button type="button" disabled={runningBenchmark} onClick={startButtonClick}>
        <FormattedMessage id="devModeBenchmarkRunCircle" />
      </button>
      <button type="button" onClick={saveButtonClick}>
        <FormattedMessage id="save" />
      </button>
      <p />
      <p>
        <FormattedMessage id="devModeBenchmarkAppSize" />
        {`: ${innerSize.x}x${innerSize.y}`}
      </p>
      <div>
        <FormattedMessage id="devModeBenchmarkEverything" />
        {`: ${allFps} FPS`}
      </div>
      <div>
        <FormattedMessage id="devModeBenchmarkToStartOnly" />
        {`: ${toStartFps} FPS`}
      </div>
      <div>
        <FormattedMessage id="devModeBenchmarkToEndOnly" />
        {`: ${toEndFps} FPS`}
      </div>
      <p />
    </div>
  )
}

export default CircleBenchmark
