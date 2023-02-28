import React, {useEffect, useMemo, useRef, useState} from 'react'
import {FPS} from 'yy-fps'
import useEngine from '../../engine/useEngine'

// Refresh timeout in milliseconds
const REFRESH_TIMEOUT = 500

// Functions defined below
let watchFps

export const CurrentFps = () => {
  const [fpsCounter, setFpsCounter] = useState('no FPS yet')
  const {app} = useEngine(false)
  const fpsGraph = useMemo(() => new FPS({meterWidth: 164}), [])
  const graphRef = useRef()

  const {ticker} = app

  useEffect(() => {
    const subscriber = () => {
      fpsGraph.frame()
    }
    ticker.add(subscriber)
    return () => {
      // if engine got destroyed before this is called, the subscriber will already be removed
      try {
        ticker.remove(subscriber)
      } catch {
        // pass
      }
    }
  }, [fpsGraph, ticker])

  useEffect(() => {
    const oldContainer = fpsGraph.div.parentElement
    fpsGraph.div.children[0].remove()
    graphRef.current.appendChild(fpsGraph.div)
    oldContainer.remove()
  }, [fpsGraph])

  watchFps(setFpsCounter)

  return (
    <>
      <div>{fpsCounter > 0 ? `${fpsCounter} FPS` : 'NaN'}</div>
      <div ref={graphRef} />
    </>
  )
}

export const watchLastAnimationFps = (setFpsCounterAnimation, event = null) => {
  const engine = useEngine(false)

  const countAnimation = useRef(0)
  const timestampStartAnimation = useRef(0)
  const runningAnimation = useRef(false)

  const {ticker} = engine.app
  const {viewport} = engine

  useEffect(() => {
    const counter = () => {
      countAnimation.current += 1
    }
    ticker.add(counter)

    return () => {
      // if engine got destroyed before this is called, the TickerListener will already be removed
      try {
        ticker.remove(counter)
      } catch {
        // pass
      }
    }
  }, [ticker, setFpsCounterAnimation])

  useEffect(() => {
    const beginMeasure = () => {
      if (runningAnimation.current) return

      const timestamp = performance.now()
      countAnimation.current = 0
      timestampStartAnimation.current = timestamp
      runningAnimation.current = true
    }
    viewport.on('moved-start', beginMeasure)

    const endMeasure = () => {
      if (!runningAnimation.current) return

      const timestamp = performance.now()
      const fps = Math.round(countAnimation.current / ((timestamp - timestampStartAnimation.current) / 1000))
      setFpsCounterAnimation(fps)
      runningAnimation.current = false
      if (event) viewport.emit(event)
    }
    viewport.on('moved-end', endMeasure)

    return () => {
      // if engine got destroyed before this is called, the TickerListener will already be removed
      try {
        viewport.off('moved-start', beginMeasure)
        viewport.off('moved-end', endMeasure)
      } catch {
        // pass
      }
    }
  }, [viewport, setFpsCounterAnimation, event])
}

export const LastAnimationFps = () => {
  const [fpsCounter, setFpsCounter] = useState(-1)

  watchLastAnimationFps(setFpsCounter)

  return <div>{fpsCounter > 0 ? `${fpsCounter} FPS` : 'no FPS yet'}</div>
}

watchFps = setFpsCounter => {
  const engine = useEngine(false)

  const count = useRef(0)
  const timeElapsed = useRef(0)

  const {ticker} = engine.app

  useEffect(() => {
    let lastTimestamp = performance.now()
    const counter = () => {
      const timestamp = performance.now()
      const delta = timestamp - lastTimestamp
      count.current += 1
      timeElapsed.current += delta
      lastTimestamp = timestamp
    }
    ticker.add(counter)

    return () => {
      // if engine got destroyed before this is called, the TickerListener will already be removed
      try {
        ticker.remove(counter)
      } catch {
        // pass
      }
    }
  }, [ticker])

  useEffect(() => {
    const ref = setInterval(() => {
      const fps = Math.round(count.current / (timeElapsed.current / 1000))
      setFpsCounter(fps)
      count.current = 0
      timeElapsed.current = 0
    }, REFRESH_TIMEOUT)

    return () => clearInterval(ref)
  }, [setFpsCounter])
}
