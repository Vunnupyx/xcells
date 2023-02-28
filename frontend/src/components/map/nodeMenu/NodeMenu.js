import {FormattedMessage, useIntl} from 'react-intl'
import React, {useState} from 'react'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import DeleteIcon from '@material-ui/icons/Delete'
import Divider from '@material-ui/core/Divider'
import AspectRatioOutIcon from '@material-ui/icons/AspectRatio'
import CallMadeIcon from '@material-ui/icons/CallMade'
import LinkIcon from '@material-ui/icons/Link'
import useEngineControl from '../../engine/useEngineControl'
import {track} from '../../../contexts/tracking'
import ContentCopy from '../../../icons/ContentCopy'
import {BorderColorPicker, FillColorPicker} from './ColorPickers'
import AspectRatioInIcon from '../../../icons/AspectRatioIn'
import {ImageMenu} from './ImageMenu'
import EDIT_MODES from '../../../engine/events/EDIT_MODES'
import useInteractionManager from '../../engine/useInteractionManager'
import useFileUpload from '../../../hooks/useFileUpload'
import AddCheckboxItem from '../toolbar/AddCheckboxItem'
import AddTagMenuItem from '../toolbar/AddTagMenuItem'

const POPPER_NAMES = {
  border: 'border',
  fill: 'fill',
  file: 'file',
  image: 'image',
  reorganize: 'reorganize',
  template: 'template',
}

const NodeMenu = ({open, onClose, ...rest}) => {
  const manager = useInteractionManager()
  const {formatMessage} = useIntl()
  const [popperName, setPopperName] = useState(null)
  const control = useEngineControl()

  const trackAction = action => {
    const details = {
      method: 'nodeContextMenu',
      selected: manager.selectedNodes.size,
    }
    track({
      action,
      details,
    })
  }

  const onContextMenu = e => {
    e.preventDefault()
  }

  const {selectedNodes, selectedEdges} = manager

  const {openFileDialog, getInputProps} = useFileUpload()

  if (!open) return null

  const createSetOpen = stateName => isOpen => setPopperName(isOpen ? stateName : null)

  return (
    <>
      <input {...getInputProps()} />
      <Menu
        id="basic-menu"
        open
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        getContentAnchorEl={null}
        onContextMenu={onContextMenu}
        onClose={onClose}
        {...rest}
      >
        {/* <MenuItem */}
        {/*  onClick={() => { */}
        {/*    copyNode() */}
        {/*    const copyData = engine.keyboardEvents.getCopyData() */}
        {/*    setClipboard('text/plain', copyData['text/plain']) */}
        {/*    setClipboard('application/json', copyData['application/json']) */}
        {/*    onClose() */}
        {/*  }} */}
        {/*  disabled={ */}
        {/*    ![...selectedNodes].find(({isRoot}) => !isRoot) || */}
        {/*    typeof window.ClipboardItem === 'undefined' || */}
        {/*    typeof navigator.clipboard.write === 'undefined' */}
        {/*  } */}
        {/* > */}
        {/*  <ListItemIcon /> */}
        {/*  Copy */}
        {/* </MenuItem> */}
        {/* <MenuItem */}
        {/*  onClick={() => { */}
        {/*    cutNode() */}
        {/*    onClose() */}
        {/*  }} */}
        {/*  disabled={![...selectedNodes].find(({isRoot}) => !isRoot)} */}
        {/* > */}
        {/*  <ListItemIcon /> */}
        {/*  Cut */}
        {/* </MenuItem> */}
        {/* <MenuItem */}
        {/*  onClick={() => { */}
        {/*    pasteNode() */}
        {/*    onClose() */}
        {/*  }} */}
        {/*  disabled={selectedNodes.size === 0} */}
        {/* > */}
        {/*  <ListItemIcon /> */}
        {/*  Paste */}
        {/* </MenuItem> */}
        <MenuItem
          onClick={() => {
            control.duplicateNode()
            onClose()
            trackAction('duplicate')
          }}
          disabled={![...selectedNodes].find(({isRoot}) => !isRoot)}
        >
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <FormattedMessage id="toolbarMenuDuplicate" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            control.removeSelected()
            onClose()
            trackAction('nodeRemove')
          }}
          disabled={![...selectedNodes].find(({isRoot}) => !isRoot) && selectedEdges.size === 0}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <FormattedMessage id="toolbarMenuDelete" />
        </MenuItem>
        <Divider />
        <FillColorPicker
          open={popperName === POPPER_NAMES.fill}
          setOpen={createSetOpen(POPPER_NAMES.fill)}
          fontSize="small"
          description={formatMessage({id: 'toolbarMenuBodyColor'})}
          placement="right-end"
          verticalMenu
          openOnlyOnClick
        />
        <BorderColorPicker
          open={popperName === POPPER_NAMES.border}
          setOpen={createSetOpen(POPPER_NAMES.border)}
          fontSize="small"
          description={formatMessage({id: 'toolbarMenuBorderColor'})}
          placement="right-end"
          verticalMenu
          openOnlyOnClick
        />
        <MenuItem
          onClick={() => {
            manager.scaleUp()
            onClose()
            trackAction('scale')
          }}
          disabled={selectedNodes.size === 0 || ![...selectedNodes].find(({isRoot}) => !isRoot)}
        >
          <ListItemIcon>
            <AspectRatioOutIcon fontSize="small" />
          </ListItemIcon>
          <FormattedMessage id="toolbarMenuScaleUp" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            manager.scaleDown()
            onClose()
            trackAction('scale')
          }}
          disabled={selectedNodes.size === 0 || ![...selectedNodes].find(({isRoot}) => !isRoot)}
        >
          <ListItemIcon>
            <AspectRatioInIcon fontSize="small" />
          </ListItemIcon>
          <FormattedMessage id="toolbarMenuScaleDown" />
        </MenuItem>
        <ImageMenu
          open={popperName === POPPER_NAMES.reorganize}
          setOpen={createSetOpen(POPPER_NAMES.reorganize)}
          fontSize="small"
          description={formatMessage({id: 'toolbarMenuCardReorder'})}
          placement="right-end"
          verticalMenu
          handleClose={onClose}
          contentType="reorganize"
          openOnlyOnClick
        />
        <Divider />
        <AddCheckboxItem />
        <AddTagMenuItem />
        <Divider />
        <MenuItem
          onClick={() => {
            manager.toggleMode(EDIT_MODES.addEdge)
            onClose()
            trackAction('edgeAdd')
          }}
          disabled={
            selectedNodes.size === 0 || (selectedEdges.size === 0 && ![...selectedNodes].find(({isRoot}) => !isRoot))
          }
        >
          <ListItemIcon>
            <CallMadeIcon color={manager.mode === EDIT_MODES.addEdge ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <FormattedMessage id="toolbarMenuCreateEdgeMode" />
        </MenuItem>
        <Divider />
        <ImageMenu
          open={popperName === POPPER_NAMES.image}
          setOpen={createSetOpen(POPPER_NAMES.image)}
          fontSize="small"
          description={formatMessage({id: 'toolbarMenuImageSettings'})}
          placement="right-end"
          verticalMenu
          handleOpenFileDialog={(...args) => {
            openFileDialog(...args)
            trackAction('nodeSetImage')
          }}
          contentType="image"
          openOnlyOnClick
        />
        <ImageMenu
          open={popperName === POPPER_NAMES.file}
          setOpen={createSetOpen(POPPER_NAMES.file)}
          fontSize="small"
          description={formatMessage({id: 'toolbarMenuFileSettings'})}
          placement="right-end"
          verticalMenu
          handleOpenFileDialog={(...args) => {
            openFileDialog(...args)
            trackAction('nodeSetFile')
          }}
          contentType="file"
          openOnlyOnClick
        />
        <ImageMenu
          open={popperName === POPPER_NAMES.template}
          setOpen={createSetOpen(POPPER_NAMES.template)}
          fontSize="small"
          description={formatMessage({id: 'toolbarMenuTemplate'})}
          placement="right-end"
          verticalMenu
          handleOpenFileDialog={(...args) => {
            openFileDialog(...args)
            trackAction('')
          }}
          contentType="template"
          openOnlyOnClick
        />
        <Divider />
        <MenuItem
          onClick={() => {
            const node = manager.lastSelectedNode
            const edge = manager.lastSelectedEdge
            const baseLink = `${window.location.protocol}//${window.location.host}/maps/${control.engine.store.mapId}`
            if (node) {
              navigator.clipboard.writeText(`${baseLink}/${node.id}`)
            } else if (edge) {
              navigator.clipboard.writeText(`${baseLink}/${edge.startNode.id}`)
            }
            onClose()
            trackAction('nodeSetUrl')
          }}
        >
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <FormattedMessage id="toolbarMenuCopyURL" />
        </MenuItem>
      </Menu>
    </>
  )
}

export default NodeMenu
