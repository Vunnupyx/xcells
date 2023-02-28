import React, {useCallback, useMemo, useState, useRef, useEffect} from 'react'

import makeStyles from '@material-ui/styles/makeStyles'
import Drawer from '@material-ui/core/Drawer'
import UndoIcon from '@material-ui/icons/Undo'
import RedoIcon from '@material-ui/icons/Redo'
import PanToolIcon from '@material-ui/icons/PanTool'
import AddBox from '@material-ui/icons/AddBox'
import {FormattedMessage} from 'react-intl'
import AddFrame from '../../../icons/AddFrame'
import TextIncrease from '../../../icons/TextIncrease'
import UploadFile from '../../../icons/UploadFile'
import AddTemplate from '../../../icons/AddTemplate'

import useDialog from '../../../hooks/useDialog'
import EDIT_MODES from '../../../engine/events/EDIT_MODES'
import TooltipButton from './TooltipButton'
import {track} from '../../../contexts/tracking'
import CONFIG from '../../../engine/CONFIG'

import useUploadDropzone, {TYPES} from '../../../hooks/useUploadDropzone'
import TemplateInsertDialog from '../../dialogs/TemplateInsertDialog'

import {hasTouchscreen} from '../../../utils/browserDetection'
import useSnackbar from '../../../hooks/useSnackbar'
import useInteractionManager from '../../engine/useInteractionManager'
import useMapStore from '../../../hooks/useMapStore'

const useDrawerStyles = makeStyles(theme => ({
  paper: {
    height: 'auto',
    flexShrink: 1,
    alignItems: 'center',
    top: '50%',
    left: theme.spacing(1),
    transform: 'translateY(-50%)',
    borderRadius: 10,
    padding: theme.spacing(0.5),
    boxShadow: theme.shadows[1],
    zIndex: theme.zIndex.appBar,
  },
}))

const INTERNAL_MODES = {
  MOVE: -1,
  NOTHING: 0,
  ADD_NODE: 1,
  ADD_FRAME: 2,
  ADD_TEXT: 3,
  ADD_FILE: 4,
  ADD_TEMPLATE: 5,
}

const toEngineMode = internMode => {
  if (internMode < 0) return EDIT_MODES.moveNode
  if (internMode === 0) return EDIT_MODES.navigate
  return EDIT_MODES.addNode
}

const MapToolbar = () => {
  const drawerClasses = useDrawerStyles()
  const eventManager = useInteractionManager()
  const {mode: managerMode, toggleMode, setMode} = eventManager
  const {canUndo, undo, canRedo, redo} = useMapStore()
  const [internMode, setInternMode] = useState(INTERNAL_MODES.NOTHING)
  const openDialog = useDialog()
  const addNode = useRef(null)
  const {info, closeSnackbar} = useSnackbar()
  const snackbarKeyRef = useRef(null)

  useEffect(() => {
    if (managerMode !== toEngineMode(internMode)) {
      if (managerMode === EDIT_MODES.navigate) {
        setInternMode(INTERNAL_MODES.NOTHING)
        if (snackbarKeyRef.current) closeSnackbar(snackbarKeyRef.current)
      } else if (managerMode === EDIT_MODES.moveNode) {
        setInternMode(INTERNAL_MODES.MOVE)
      }
    }
  }, [managerMode, internMode, setInternMode, closeSnackbar])

  const createToggleMode = useCallback(
    modeName => () => {
      toggleMode(modeName)
    },
    [toggleMode],
  )

  const getIconColor = mode => {
    if (mode === INTERNAL_MODES.MOVE) {
      return managerMode === EDIT_MODES.moveNode ? 'primary' : 'inherit'
    }
    if (managerMode !== EDIT_MODES.addNode) return 'inherit'
    return internMode === mode ? 'primary' : 'inherit'
  }

  const toggleModeMoveNode = useMemo(() => createToggleMode(EDIT_MODES.moveNode), [createToggleMode])

  /**
   * Depending on the clicked Button (nextMode) this function returns a state-change-function, that
   *  - switches the intern state and the EventManager state to nextMode if this mode was not already selected, or
   *  - switches to modeMode otherwise
   */
  const createHandleAddModeChange = useCallback(
    nextMode => prevMode => {
      setMode(EDIT_MODES.navigate)
      if (prevMode !== nextMode) {
        setMode(EDIT_MODES.addNode)
        addNode.current = eventManager.createAddNode()
      }
      return prevMode === nextMode ? INTERNAL_MODES.NOTHING : nextMode
    },
    [eventManager, setMode],
  )

  const writeAddInfo = useCallback(
    type => {
      track({action: 'toolbarClick', details: {type, method: 'toolbar'}})
      if (hasTouchscreen) {
        snackbarKeyRef.current = info(<FormattedMessage id="snackbarInfoAddCard" />)
      }
    },
    [info],
  )

  const onAddNode = () => {
    setInternMode(createHandleAddModeChange(INTERNAL_MODES.ADD_NODE))
    writeAddInfo('onAddNode')
    const {style, permanent} = CONFIG.nodes.addNodeSettings
    eventManager.setNodeProperties(addNode.current, style, permanent)
  }

  const onAddFrame = () => {
    setInternMode(createHandleAddModeChange(INTERNAL_MODES.ADD_FRAME))
    writeAddInfo('onAddFrame')
    const {style, permanent} = CONFIG.nodes.addFrameSettings
    eventManager.setNodeProperties(addNode.current, style, permanent)
  }

  const onAddText = () => {
    setInternMode(createHandleAddModeChange(INTERNAL_MODES.ADD_TEXT))
    writeAddInfo('onAddText')
    const {style, permanent} = CONFIG.nodes.addTextSettings
    eventManager.setNodeProperties(addNode.current, style, permanent)
  }

  const cancelAddMode = useCallback(() => {
    setMode(EDIT_MODES.navigate)
  }, [setMode])

  const onFileUploadSuccess = useCallback(
    result => {
      if (result.length === 0) {
        cancelAddMode()
        return
      }

      const [file, {_id: id}, fileData] = result
      writeAddInfo('onFileUploadSuccess')
      if (fileData.fileType === TYPES.image) {
        const {style: originalStyle, permanent} = CONFIG.nodes.addImageSettings
        const style = {...originalStyle}
        style.image = id
        style.title += file.name
        if (fileData.width && fileData.height) {
          const aspectRation = fileData.width / fileData.height
          const imageHeight = style.width / aspectRation
          style.height = Math.ceil(imageHeight / CONFIG.nodes.gridSize) * CONFIG.nodes.gridSize
        } else {
          style.height = CONFIG.nodes.create.height
        }
        eventManager.setNodeProperties(addNode.current, style, permanent)
      } else if (fileData.fileType === TYPES.file) {
        const {style, permanent} = CONFIG.nodes.addFileSettings
        style.file = id
        style.title = file.name
        eventManager.setNodeProperties(addNode.current, style, permanent)
      }
      eventManager.commitDispatches()
    },
    [cancelAddMode, eventManager, writeAddInfo],
  )

  const {getInputProps, open: openFileDialog} = useUploadDropzone(onFileUploadSuccess, cancelAddMode)

  const handleOpenFileDialog = useCallback(() => {
    openFileDialog()
  }, [openFileDialog])

  const onAddFile = () => {
    setInternMode(createHandleAddModeChange(INTERNAL_MODES.ADD_FILE))
    if (internMode !== INTERNAL_MODES.ADD_FILE) {
      handleOpenFileDialog()
    }
  }

  const onAddTemplate = () => {
    setInternMode(createHandleAddModeChange(INTERNAL_MODES.ADD_TEMPLATE))
    if (internMode !== INTERNAL_MODES.ADD_TEMPLATE) {
      const onSuccess = template => {
        writeAddInfo('onAddTemplate')
        eventManager.setNodeTemplate(addNode.current, template)
        eventManager.commitDispatches()
      }
      openDialog(TemplateInsertDialog(onSuccess, cancelAddMode))
    }
  }

  const onMoveMode = () => {
    toggleModeMoveNode()
    setInternMode(mode => (mode === INTERNAL_MODES.MOVE ? INTERNAL_MODES.NOTHING : INTERNAL_MODES.MOVE))
    track({action: 'moveMode', details: {method: 'toolbar'}})
  }

  return (
    <Drawer open variant="persistent" anchor="left" classes={drawerClasses}>
      <TooltipButton
        icon={<UndoIcon />}
        titleId="toolbarTooltipUndo"
        onClick={() => {
          undo()
          track({action: 'undo', details: {method: 'toolbar'}})
        }}
        disabled={!canUndo}
      />
      <TooltipButton
        icon={<RedoIcon />}
        titleId="toolbarTooltipRedo"
        onClick={() => {
          redo()
          track({action: 'redo', details: {method: 'toolbar'}})
        }}
        disabled={!canRedo}
      />
      <TooltipButton
        icon={<AddBox color={getIconColor(INTERNAL_MODES.ADD_NODE)} />}
        titleId="toolbarTooltipCreateNodeMode"
        onClick={onAddNode}
      />
      <TooltipButton
        icon={<AddFrame color={getIconColor(INTERNAL_MODES.ADD_FRAME)} />}
        titleId="toolbarTooltipCreateFrame"
        onClick={onAddFrame}
      />
      <TooltipButton
        icon={<TextIncrease color={getIconColor(INTERNAL_MODES.ADD_TEXT)} />}
        titleId="toolbarTooltipCreateText"
        onClick={onAddText}
      />
      <TooltipButton
        icon={<UploadFile color={getIconColor(INTERNAL_MODES.ADD_FILE)} />}
        titleId="toolbarTooltipCreateFile"
        onClick={onAddFile}
      />
      <TooltipButton
        icon={<AddTemplate color={getIconColor(INTERNAL_MODES.ADD_TEMPLATE)} />}
        titleId="toolbarTooltipInsertTemplate"
        onClick={onAddTemplate}
      />
      <input {...getInputProps()} />
      <TooltipButton
        icon={<PanToolIcon color={getIconColor(INTERNAL_MODES.MOVE)} />}
        titleId="toolbarTooltipMoveNodeMode"
        onClick={onMoveMode}
      />
    </Drawer>
  )
}

export default MapToolbar
