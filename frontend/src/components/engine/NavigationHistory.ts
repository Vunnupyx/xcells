import {useEffect, useRef} from 'react'
import EventEmitter from 'eventemitter3'
import type {Viewport} from 'pixi-viewport'

import type PixiRenderEngine from '../../engine/PixiRenderEngine'
import PixiNode from '../../engine/PixiNode'
import concatPathAnchor from '../../utils/concatPathAnchor'

type TNodeEventPayload = {node: PixiNode; viewport: Viewport}
type TNavigationEventTrigger = {
  getTarget: (engine: PixiRenderEngine) => EventEmitter
  eventName: string
  createUrl: (event: TNodeEventPayload, engine: PixiRenderEngine) => string
}

const navigationEventTrigger: TNavigationEventTrigger[] = [
  {
    getTarget: engine => engine,
    eventName: 'zoom-to-node',
    createUrl: ({node}, engine) => concatPathAnchor(`/maps/${engine.mapId}/${node.id}`, node.title),
  },
  // TODO: these event will also be called for the first zoom-to-node, e.g.
  // ...['mouse-edge-end', 'drag-end', 'pinch-end', 'zoomed-end'].map(
  //   eventName =>
  //     ({
  //       getTarget: engine => engine.viewport,
  //       eventName,
  //       createUrl: (_, {viewport}) => {
  //         const {pathname, hash} = window.location
  //         return `${pathname}?x=${viewport.x},y=${viewport.y},s=${viewport.scale.x}${hash}`
  //       },
  //     } as TNavigationEventTrigger),
  // ),
]

function NavigationHistory({engine}: {engine: PixiRenderEngine}) {
  const lastNavigationEvent = useRef('')

  useEffect(() => {
    if (window.history) {
      const unsubscribers = navigationEventTrigger.map(({getTarget, eventName, createUrl}) => {
        const target = getTarget(engine)
        const subscriber = (event: TNodeEventPayload): void => {
          const url = createUrl(event, engine)

          window.history.pushState({key: Math.random().toString(36).substring(2, 10)}, '', url)
          // if (lastNavigationEvent.current === eventName) {
          //   window.history.replaceState({}, '', url)
          // } else {
          //   window.history.pushState({}, '', url)
          // }

          lastNavigationEvent.current = eventName
        }
        target.on(eventName, subscriber)
        return () => target.off(eventName, subscriber)
      })

      return () => {
        unsubscribers.forEach(unsub => unsub())
      }
    }

    return () => undefined
  }, [engine])

  return null
}

export default NavigationHistory
