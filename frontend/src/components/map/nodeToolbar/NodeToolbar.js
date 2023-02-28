import React, {useCallback, useEffect, useRef, useState} from 'react'
import {FormattedMessage} from 'react-intl'

import makeStyles from '@material-ui/styles/makeStyles'
import Drawer from '@material-ui/core/Drawer'
import Grid from '@material-ui/core/Grid'
import AspectRatioOutIcon from '@material-ui/icons/AspectRatio'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import CallMadeIcon from '@material-ui/icons/CallMade'
import EditIcon from '@material-ui/icons/Edit'
import Button from '@material-ui/core/Button'

import useInteractionManager from '../../engine/useInteractionManager'
import AspectRatioInIcon from '../../../icons/AspectRatioIn'
import EDIT_MODES from '../../../engine/events/EDIT_MODES'
import {hasTouchscreen, isMobile, isTablet} from '../../../utils/browserDetection'
import {track} from '../../../contexts/tracking'

import {BorderColorPicker, FillColorPicker} from '../nodeMenu/ColorPickers'
import ToolbarItem from '../toolbar/ToolbarItem'
import {ImageMenu} from '../nodeMenu/ImageMenu'
import NodeMenu from '../nodeMenu/NodeMenu'
import useFileUpload from '../../../hooks/useFileUpload'
import {NODE_TOOLBAR_BUTTON_CLASS} from '../../../shared/config/constants'
import {add} from '../../../store/actions'
import useViewport from '../../engine/useViewport'
import px from '../../../engine/utils/px'

const useDrawerStyles = makeStyles(theme => ({
  paper: {
    height: 'auto',
    position: 'absolute',
    flexShrink: 0,
    alignItems: 'center',
    transform: 'translate(-50%, 0) !important',
    borderRadius: 10,
    padding: theme.spacing(0.5),
    boxShadow: theme.shadows[1],
    zIndex: theme.zIndex.appBar,
  },
}))

const calculatePosition = (manager, viewport) => {
  const {lastSelectedNode, lastSelectedAll} = manager

  if (
    !lastSelectedNode ||
    lastSelectedNode !== lastSelectedAll ||
    lastSelectedNode.isRoot ||
    !lastSelectedNode.elements.parent
  ) {
    return null
  }

  const node = lastSelectedNode

  const upperThreshold = 100
  const barHeight = 60
  const barWidth = 440
  const width = viewport.screenWidth
  const height = viewport.screenHeight
  const bottom_right = node.elements.parent.toGlobal(node.getCornerBottomRight())
  const coordinates = node.getGlobalPosition()
  let colorPickerPlacement = 'bottom'

  // Material UI does the job, we don't need to do anything else here
  coordinates.x = (coordinates.x + bottom_right.x) / 2

  // both left and right edge of node are outside of viewport
  if (node.getGlobalPosition().x < 0 && bottom_right.x > width) {
    coordinates.x = width / 2
  }
  // only right edge of node outside of viewport
  else if (node.getGlobalPosition().x < width && bottom_right.x > width) {
    coordinates.x = Math.min(coordinates.x, width - barWidth / 2)
  }
  // only left edge of node outside of viewport
  else if (node.getGlobalPosition().x < 0 && bottom_right.x > 0) {
    coordinates.x = Math.max(coordinates.x, barWidth / 2)
  }
  if (coordinates.y < upperThreshold && bottom_right.y - barHeight > height - upperThreshold) {
    coordinates.y = bottom_right.y - barHeight
  }
  if (coordinates.y < upperThreshold && bottom_right.y - barHeight < height) {
    coordinates.y = bottom_right.y + barHeight + 10
    colorPickerPlacement = 'top'
  }
  // keep toolbar visible when default position is out of viewport
  coordinates.y = Math.max(coordinates.y - barHeight, barHeight)
  coordinates.y = Math.min(coordinates.y, height - barHeight)

  if (coordinates.y > 170) colorPickerPlacement = 'top'

  return {
    x: coordinates.x,
    y: coordinates.y,
    colorPickerPlacement,
  }
}

const POPPER_NAMES = {
  fillColor: 'fillColor',
  borderColor: 'borderColor',
  moreMenu: 'moreMenu',
  image: 'image',
}

const VIEWPORT_EVENT_PREFIX = ['zoom', 'drag', 'pinch', 'mouse-edge']

const NodeToolbar = ({focusMode}) => {
  const viewport = useViewport()
  const drawerClasses = useDrawerStyles()
  const manager = useInteractionManager()
  const {lastSelectedNode, selectedNodes, mode, state} = manager
  const [openPopperName, setOpenPopperName] = useState(null)
  const moreMenuRef = useRef()
  const paperRef = useRef()

  useEffect(() => {
    const hideToolbar = () => (paperRef.current ? (paperRef.current.style.display = 'none') : undefined)
    const showToolbar = () => (paperRef.current ? (paperRef.current.style.display = 'block') : undefined)

    VIEWPORT_EVENT_PREFIX.forEach(prefix => {
      viewport.on(`${prefix}-start`, hideToolbar)
      viewport.on(`${prefix}-end`, showToolbar)
      viewport.on(`${prefix}-remove`, showToolbar)
    })

    return () => {
      VIEWPORT_EVENT_PREFIX.forEach(prefix => {
        viewport.off(`${prefix}-start`, hideToolbar)
        viewport.off(`${prefix}-end`, showToolbar)
        viewport.off(`${prefix}-remove`, showToolbar)
      })
    }
  }, [viewport])

  useEffect(() => {
    const update = () => {
      if (paperRef.current) {
        const position = calculatePosition(manager, viewport)
        if (position) {
          paperRef.current.style.left = px(position.x)
          paperRef.current.style.top = px(position.y)
        } else {
          paperRef.current.style.display = 'none'
        }
      }
    }

    viewport.on('moved', update)
    return () => viewport.off('moved', update)
  }, [manager, viewport])

  const {openFileDialog, getInputProps} = useFileUpload()

  const onClose = useCallback(() => setOpenPopperName(null), [setOpenPopperName])

  const {size: selected} = selectedNodes
  const {isDragged, isCtrlPressed, isShiftPressed, isAltPressed} = state

  const trackAction = action => {
    const method = 'nodeToolbar'
    const details = {method, selected}
    if (action === 'nodeRemove') details.selected += 1
    track({
      action,
      details,
    })
  }

  if (mode !== EDIT_MODES.navigate || isDragged || isCtrlPressed || isShiftPressed || isAltPressed || focusMode)
    return null

  const position = calculatePosition(manager, viewport)

  if (!position) return null

  const createSetOpen = stateName => isOpen => setOpenPopperName(isOpen ? stateName : null)

  const saveTemporaryNodes = () => {
    const temporaryNodes = [...manager.selectedNodes].filter(node => node.state.isTemporary)
    temporaryNodes.forEach(node => (node.state.isTemporary = false))
    manager.addDispatch(temporaryNodes.map(node => add(node)))
    manager.saveNodes()
  }

  return (
    <div>
      <input {...getInputProps()} />
      <Drawer
        open
        variant="persistent"
        PaperProps={{
          ref: paperRef,
          style: {
            left: position.x,
            top: position.y,
            display: 'block',
          },
        }}
        classes={drawerClasses}
      >
        <Grid container spacing={0} direction="row" wrap="nowrap">
          <ToolbarItem
            onClick={() => {
              saveTemporaryNodes()
              manager.toggleMode(EDIT_MODES.addEdge)
              trackAction('edgeAdd')
            }}
            title={<FormattedMessage id="toolbarTooltipCreateEdgeMode" />}
            className={NODE_TOOLBAR_BUTTON_CLASS}
          >
            <CallMadeIcon />
          </ToolbarItem>
          <ToolbarItem
            onClick={() => {
              saveTemporaryNodes()
              manager.scaleDown()
              trackAction('scale')
            }}
            title={<FormattedMessage id="toolbarTooltipScaleDown" />}
            className={NODE_TOOLBAR_BUTTON_CLASS}
          >
            <AspectRatioInIcon />
          </ToolbarItem>
          {!isMobile ? (
            <ToolbarItem
              onClick={() => {
                saveTemporaryNodes()
                manager.scaleUp()
                trackAction('scale')
              }}
              title={<FormattedMessage id="toolbarTooltipScaleUp" />}
              className={NODE_TOOLBAR_BUTTON_CLASS}
            >
              <AspectRatioOutIcon />
            </ToolbarItem>
          ) : null}
          <Grid item xs="auto">
            <FillColorPicker
              open={openPopperName === POPPER_NAMES.fillColor}
              setOpen={createSetOpen(POPPER_NAMES.fillColor)}
              fontSize="small"
              placement={position.colorPickerPlacement}
              openOnlyOnClick
              buttonClassName={NODE_TOOLBAR_BUTTON_CLASS}
            />
          </Grid>

          {!isMobile ? (
            <Grid item xs="auto">
              <BorderColorPicker
                open={openPopperName === POPPER_NAMES.borderColor}
                setOpen={createSetOpen(POPPER_NAMES.borderColor)}
                fontSize="small"
                placement={position.colorPickerPlacement}
                openOnlyOnClick
                buttonClassName={NODE_TOOLBAR_BUTTON_CLASS}
              />
            </Grid>
          ) : null}

          <Grid item xs="auto">
            <ImageMenu
              open={openPopperName === POPPER_NAMES.image}
              setOpen={createSetOpen(POPPER_NAMES.image)}
              fontSize="small"
              placement={position.colorPickerPlacement}
              handleOpenFileDialog={(...args) => {
                saveTemporaryNodes()
                openFileDialog(...args)
                trackAction('nodeSetImage')
              }}
              contentType="image"
              splitButton
              openOnlyOnClick
              buttonClassName={NODE_TOOLBAR_BUTTON_CLASS}
            />
          </Grid>
          {isTablet || isMobile || hasTouchscreen ? (
            <ToolbarItem
              onClick={() => {
                lastSelectedNode.openTextField()
              }}
              title={<FormattedMessage id="toolbarTooltipEdit" />}
              disabled={Boolean(lastSelectedNode)}
              className={NODE_TOOLBAR_BUTTON_CLASS}
            >
              <EditIcon />
            </ToolbarItem>
          ) : null}
          <Grid item xs="auto">
            <Button
              onClick={() => {
                saveTemporaryNodes()
                setOpenPopperName(POPPER_NAMES.moreMenu)
              }}
              ref={moreMenuRef}
              className={NODE_TOOLBAR_BUTTON_CLASS}
            >
              <MoreVertIcon />
            </Button>
            {openPopperName === POPPER_NAMES.moreMenu ? (
              <NodeMenu open onClose={onClose} anchorEl={moreMenuRef.current} />
            ) : null}
          </Grid>
        </Grid>
      </Drawer>
    </div>
  )
}

export default NodeToolbar
