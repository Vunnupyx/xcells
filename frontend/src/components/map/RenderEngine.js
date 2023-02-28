import React, {useEffect, useMemo, useRef, useState} from 'react'
import {useLocation, useParams} from 'react-router-dom'
import {FormattedMessage} from 'react-intl'

import makeStyles from '@material-ui/styles/makeStyles'

import useEngine from '../engine/useEngine'
import useMapStore from '../../hooks/useMapStore'
import ProgressModal from '../ProgressModal'
import useDialog from '../../hooks/useDialog'
import HelpModal from '../HelpModal'
import useEngineControl from '../engine/useEngineControl'

// import FileDragDropHandler from '../../engine/events/FileDragDropHandler'

const useStyles = makeStyles({
  engine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  engineContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    touchAction: 'none',
    // create a new context, so textfields will not overlap images and controls, see
    // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context
    zIndex: 0,
  },
})

const RenderEngine = () => {
  const {mapId, nodeId} = useParams()
  const {search} = useLocation()
  const renderRef = useRef()
  const {isLoading, root} = useMapStore()

  const engine = useEngine()
  const classes = useStyles()
  const containerRef = useRef()

  const control = useEngineControl()

  const searchParams = useMemo(() => new URLSearchParams(search), [search])
  const {renderNodes} = engine

  // disable ctrl+mouse wheel to change font size
  useEffect(() => {
    const disableZoom = event => {
      event.preventDefault()
      return false
    }

    const container = containerRef.current

    if (container) {
      container.addEventListener('DOMMouseScroll', disableZoom, false)
      container.addEventListener('mousewheel', disableZoom, false)
      container.addEventListener('wheel', disableZoom, false)
      document.body.style.touchAction = 'none'
      document.body.style.overflow = 'hidden'
    }
    return () => {
      container.removeEventListener('DOMMouseScroll', disableZoom)
      container.removeEventListener('mousewheel', disableZoom)
      container.removeEventListener('wheel', disableZoom)
      setTimeout(() => document.body.removeAttribute('style'), 0)
    }
  }, [])

  // mount the render engine
  useEffect(() => {
    const ref = renderRef.current
    // loading needs to be here, as the ref is not rendered, until the store is loaded
    if (ref) {
      engine.mount(ref)
      return () => engine.unmount(ref)
    }
    return () => undefined
  }, [engine, mapId])

  const [zoomedIn, setZoomedId] = useState(false)
  useEffect(() => {
    if (!isLoading && Object.keys(renderNodes).length && !zoomedIn) {
      if (['x', 'y', 's'].every(coord => searchParams.has(coord))) {
        // TODO: this creates an infinite loop
        // control.goToViewport(...['x', 'y', 's'].map(coord => searchParams.get(coord)).map(Number))
      } else if (root) {
        control.goToNode(nodeId || root)
      }
      setZoomedId(true)
    }
  }, [isLoading, control, nodeId, root, mapId, searchParams, renderNodes, zoomedIn])

  const openDialog = useDialog()
  useEffect(() => {
    const bindElement = renderRef.current
    const openHelp = event => {
      const {ctrlKey, metaKey, shiftKey, key} = event

      if (!shiftKey && !metaKey && !ctrlKey && key === 'F1') {
        openDialog(HelpModal)
        event.preventDefault()
        event.stopPropagation()
      }
    }

    window.addEventListener('keydown', openHelp)
    bindElement.addEventListener('keydown', openHelp)
    return () => {
      window.removeEventListener('keydown', openHelp)
      bindElement.removeEventListener('keydown', openHelp)
    }
  }, [openDialog])

  return (
    <>
      <div ref={containerRef} className={classes.engineContainer}>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
        <div className={classes.engine} id={`infinityMap${mapId}`} ref={renderRef} />
      </div>
      <ProgressModal open={isLoading}>
        <FormattedMessage id="mapLoading" /> ...
      </ProgressModal>
    </>
  )
}

export default RenderEngine
