import React, {useCallback, useEffect, useState, useRef} from 'react'
import {useHistory} from 'react-router-dom'

import makeStyles from '@material-ui/styles/makeStyles'

import clsx from 'clsx'
import {FormattedMessage} from 'react-intl'
import {Point} from 'pixi.js'
import useMapStore from '../../hooks/useMapStore'

import useAuth from '../../hooks/useAuth'
import GuestSignupBox from './GuestSignupBox'
import HiddenInIframe from '../hide/HiddenInIframe'
import MapToolbar from './toolbar/MapToolbar'
import DevModeDialogs from './devMode/DevModeDialogs'
import AppBar from './appbar/AppBar'
import FeedbackButton from '../FeedbackButton'
import RenderEngine from './RenderEngine'
import Paths from './presentation/Paths'
import HelmetTitle from '../wrapped/HelmetTitle'
import useEngine from '../engine/useEngine'
import useViewport from '../engine/useViewport'
import CollaboratorCursorsContainer from './collaboration/CollaboratorCursorsContainer'
import {isMobile, isTablet} from '../../utils/browserDetection'
import useSnackbar from '../../hooks/useSnackbar'
import OnboardingGifsWrite from './OnboardingGifsWrite'
import OnboardingGifsReadOnly from './OnboardingGifsReadOnly'
import {getUrlFlag, LOAD_MAP_BENCHMARK} from '../../utils/urlFlags'
import FocusModeButton from '../FocusModeButton'
import NodeToolbar from './nodeToolbar/NodeToolbar'
import {track} from '../../contexts/tracking'
import NodeContextMenu from './nodeMenu/NodeContextMenu'
import {ORIGIN} from '../../utils/points'
import EDIT_MODES from '../../engine/events/EDIT_MODES'
import TARGET_CATEGORIES from '../../engine/TARGET_CATEGORIES'
import useDialog from '../../hooks/useDialog'
import PasteActionDialog from '../dialogs/PasteActionDialog'
import CONFIG from '../../engine/CONFIG'

const useStyles = makeStyles(() => ({
  map: {
    gridColumn: 1,
    width: '100vw',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 0,
    margin: 0,
    overflow: 'hidden',
  },
  mapDrawerOpen: {
    gridColumn: 1,
    width: `calc(100vw - ${400}px)`,
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 400,
    bottom: 0,
    padding: 0,
    margin: 0,
    overflow: 'hidden',
  },
}))

const MapViewContainer = ({measureStartTime = 0}) => {
  const history = useHistory()

  const {title, isWriteable, isLoading} = useMapStore()
  const {isLoggedIn} = useAuth()
  const [presentMode, setPresentMode] = useState(false)
  const [pathMode, setPathMode] = useState(false)
  const {warning} = useSnackbar()
  const [focusMode, setFocusMode] = useState(false)
  const [searchOpen, setSearchVisible] = useState(false)
  const addNodeRef = useRef(null)

  const engine = useEngine(false)
  const viewport = useViewport()

  const [measureTime] = useState(getUrlFlag(LOAD_MAP_BENCHMARK) === 'true')

  const lastDragPosition = useRef(new Point(ORIGIN.x, ORIGIN.y))
  const {eventManager: manager} = engine
  const interactionManager = engine.app.renderer.plugins.interaction
  const openDialog = useDialog()

  useEffect(() => {
    if (isMobile) {
      warning(<FormattedMessage id="warningMobile" />)
    } else if (isTablet) {
      warning(<FormattedMessage id="warningTablet" />)
    }
  }, [warning])

  useEffect(() => {
    engine.onResizeWindow()
  }, [engine, pathMode, presentMode])

  const classes = useStyles()

  if (!isLoading && measureTime) {
    const time = (new Date().getTime() - measureStartTime) / 1000
    history.push({
      pathname: '/benchmarkResult',
      // eslint-disable-next-line object-shorthand
      state: {mapLoadingTime: time},
    })
  }

  const toggleFocusMode = useCallback(() => {
    setFocusMode(isCurrentlyEnabled => {
      const isEnabled = !isCurrentlyEnabled
      track({action: 'zenMode', details: {isEnabled}})
      return isEnabled
    })
  }, [setFocusMode])

  const openSearchArea = useCallback(() => {
    setSearchVisible(false)
    setSearchVisible(true)
  }, [setSearchVisible])

  const closeSearchArea = useCallback(() => {
    setSearchVisible(false)
  }, [setSearchVisible])

  useEffect(() => {
    viewport.on('spacebar', toggleFocusMode)
    viewport.on('search', openSearchArea)
    viewport.on('escape', closeSearchArea)

    return () => {
      viewport.off('spacebar', toggleFocusMode)
      viewport.off('search', openSearchArea)
      viewport.off('escape', closeSearchArea)
    }
  }, [viewport, toggleFocusMode, closeSearchArea, openSearchArea])

  const onDragEnter = useCallback(() => {
    lastDragPosition.current = new Point(ORIGIN.x, ORIGIN.y)
    manager.setMode(EDIT_MODES.addNode)
    addNodeRef.current = manager.createAddNode()
    const {style, permanent} = CONFIG.nodes.dragNodeSettings
    manager.setNodeProperties(addNodeRef.current, style, permanent)
  }, [manager])

  const moveAddNodeToDragPosition = useCallback(() => {
    const getMapPosition = clientPosition => {
      const getNodeUnderEvent = clientPos => {
        const hitObject = interactionManager.hitTest(clientPos, viewport)
        if (!hitObject) return undefined
        const {category} = hitObject
        if (category !== TARGET_CATEGORIES.node) return undefined
        if (!('node' in hitObject)) return undefined
        return hitObject.node
      }
      const targetNode = getNodeUnderEvent(clientPosition)
      if (!targetNode) return undefined

      return {
        parent: targetNode,
        posInParent: targetNode.elements.childrenContainer.toLocal(clientPosition),
      }
    }
    const result = getMapPosition(lastDragPosition.current)
    if (!result) return

    // start: from NodeAddHover.move
    const {parent: targetNode, posInParent: position} = result

    const addNode = manager.getAddNode()

    if (!targetNode || !addNode || targetNode === addNode) return

    if (targetNode !== addNode.parentNode) {
      addNode.setParent(targetNode)

      // recollapse the node if a node was decollapsed
      manager.recollapse()
      if (targetNode.isCollapsed) {
        manager.decollapse(targetNode)
      }
      addNode.setCache(false)
    }
    addNode.move(position.x, position.y, true)
    addNode.redraw()
    // end: from NodeAddHover.move

    engine.scheduleRender().then()
  }, [engine, interactionManager, manager, viewport])

  const onDragOver = useCallback(
    event => {
      lastDragPosition.current = new Point(event.clientX, event.clientY)
      moveAddNodeToDragPosition()
    },
    [moveAddNodeToDragPosition],
  )

  const onDragLeave = useCallback(() => {
    manager.setMode(EDIT_MODES.navigate)
    lastDragPosition.current = new Point(ORIGIN.x, ORIGIN.y)
    addNodeRef.current = null
  }, [manager])

  const getAction = useCallback(
    async content => {
      const actions = engine.pasteActionHandler.getActions(content)
      if (actions.length === 0) return undefined
      if (actions.length === 1) return actions[0]
      const actionNames = actions.map(action => action.name)
      const action = await new Promise(resolve => {
        openDialog(PasteActionDialog, {actionList: actionNames, onActionSelected: index => resolve(actions[index])})
      })
      return action
    },
    [engine.pasteActionHandler, openDialog],
  )

  const onDrop = useCallback(
    async event => {
      if (!isWriteable || !event.dataTransfer) return

      window.focus()

      manager.setMode(EDIT_MODES.navigate)
      moveAddNodeToDragPosition()
      addNodeRef.current = null

      const content = {
        files: [...event.dataTransfer.items].map(item => item.getAsFile()).filter(file => file != null),
        text: event.dataTransfer.getData('text/plain'),
        types: [...event.dataTransfer.types].map(item => item),
      }

      // start: from NodeAddClick.up
      const addNode = manager.getAddNode()
      manager.saveAddNode()
      manager.nodeGrow(addNode.parentNode)
      manager.saveNodes()
      manager.selectSingleNode(addNode)
      // end: from NodeAddClick.up

      const action = await getAction(content)
      document.body.style.cursor = 'wait'
      if (action) await action.paste(addNode, content, id => warning(<FormattedMessage id={id} />))
      document.body.style.cursor = 'default'

      manager.commitDispatches()

      engine.scheduleRender().then()
      event.preventDefault()
      event.stopPropagation()

      if (action && action.afterPaste) action.afterPaste(addNode)
    },
    [engine, getAction, isWriteable, manager, moveAddNodeToDragPosition, warning],
  )

  // TODO: Include DevModeDialogs at a better place, it's not very usable for mobile devices yet
  return (
    <div
      className={clsx(classes.map, {
        [classes.mapDrawerOpen]: pathMode && !presentMode,
      })}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <HelmetTitle title={title} />
      {!presentMode && !isLoading && !focusMode ? <DevModeDialogs /> : null}
      {!presentMode ? (
        <AppBar
          presentMode={presentMode}
          setPresentMode={setPresentMode}
          pathMode={pathMode}
          setPathMode={setPathMode}
          focusMode={focusMode}
          searchOpen={searchOpen}
          setSearchVisible={setSearchVisible}
        />
      ) : null}
      {!presentMode && !focusMode ? <FeedbackButton /> : null}
      {!presentMode ? <FocusModeButton focusMode={focusMode} toggleFocusMode={toggleFocusMode} /> : null}
      {!presentMode && isWriteable && !focusMode ? <MapToolbar /> : null}
      {!presentMode && isWriteable ? <NodeToolbar focusMode={focusMode} /> : null}
      {!presentMode && isWriteable ? <NodeContextMenu /> : null}
      <RenderEngine />
      <CollaboratorCursorsContainer />
      {isWriteable && (presentMode || pathMode) ? (
        <Paths
          setPresentMode={setPresentMode}
          presentMode={presentMode}
          pathMode={pathMode}
          setPathMode={setPathMode}
        />
      ) : null}
      {!isWriteable && !isLoading ? <OnboardingGifsReadOnly /> : null}
      {isWriteable && !isLoading ? <OnboardingGifsWrite /> : null}

      {!isLoggedIn ? (
        <HiddenInIframe>
          <GuestSignupBox />
        </HiddenInIframe>
      ) : null}
    </div>
  )
}

export default MapViewContainer
