import React from 'react'
import {FormattedMessage} from 'react-intl'

import MenuList from '@material-ui/core/MenuList'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import makeStyles from '@material-ui/styles/makeStyles'
import ImageIcon from '@material-ui/icons/Image'
import AddPhotoAlternateIcon from '@material-ui/icons/AddPhotoAlternate'
import AttachFileIcon from '@material-ui/icons/AttachFile'
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile'
import Dashboard from '@material-ui/icons/Dashboard'
import BrightnessIcon from '@material-ui/icons/Brightness1'
import DeleteIcon from '@material-ui/icons/Delete'

import useInteractionManager from '../../engine/useInteractionManager'
import {IMAGE_POSITIONS} from '../../../shared/config/constants'
import {PopUpContainer} from './PopUpContainer'
import TemplateCreateDialog from '../../dialogs/TemplateCreateDialog'
import TemplateInsertDialog from '../../dialogs/TemplateInsertDialog'
import useDialog from '../../../hooks/useDialog'
import {track} from '../../../contexts/tracking'
import CardReorgMenu from './CardReorgMenu'
import {addTemplate} from '../../../store/actions'
import useEngineControl from '../../engine/useEngineControl'

const useStyles = makeStyles(theme => ({
  listItem: {
    padding: theme.spacing(0.5),
    justifyContent: 'flex-start',
  },
}))

const trackAction = (action, position) => {
  const details = {}
  if (position !== undefined) details.position = position
  track({action, details})
}

const VerticalMenu = ({
  handleOpenFileDialog,
  classes,
  deleteImage,
  isCardWithImagesSelected,
  imagePositionIcons,
  setImagePosition,
}) => (
  <MenuList>
    <MenuItem
      className={classes.listItem}
      style={{
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 6,
        paddingBottom: 6,
      }}
      onClick={() => {
        handleOpenFileDialog()
      }}
    >
      <ListItemIcon>
        <AddPhotoAlternateIcon />
      </ListItemIcon>
      <FormattedMessage id="toolbarMenuImage" />
    </MenuItem>
    <MenuItem
      className={classes.listItem}
      onClick={() => {
        deleteImage()
      }}
      style={{
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 6,
        paddingBottom: 6,
      }}
      disabled={isCardWithImagesSelected}
    >
      <ListItemIcon>
        <DeleteIcon />
      </ListItemIcon>
      <FormattedMessage id="toolbarMenuImageDelete" />
    </MenuItem>

    {Object.values(IMAGE_POSITIONS).map(position => (
      <MenuItem
        className={classes.listItem}
        key={position}
        disabled={isCardWithImagesSelected}
        style={{
          paddingLeft: 16,
          paddingRight: 16,
        }}
        onClick={() => {
          setImagePosition(position)
        }}
      >
        {imagePositionIcons[position] ? <ListItemIcon>{imagePositionIcons[position]}</ListItemIcon> : <ListItemIcon />}
        <FormattedMessage id={`toolbarMenu.imagePositions.titles.${position}`} />
      </MenuItem>
    ))}
  </MenuList>
)

const HorizontalMenu = ({classes, deleteImage, isCardWithImagesSelected, imagePositionIcons, setImagePosition}) => (
  <MenuList>
    <MenuItem
      className={classes.listItem}
      style={{
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 6,
        paddingBottom: 6,
      }}
      onClick={() => {
        deleteImage()
        trackAction('imageDelete')
      }}
      disabled={isCardWithImagesSelected}
    >
      <ListItemIcon>
        <DeleteIcon />
      </ListItemIcon>
      <FormattedMessage id="toolbarMenuImageDelete" />
    </MenuItem>

    {Object.values(IMAGE_POSITIONS).map(position => (
      <MenuItem
        className={classes.listItem}
        key={position}
        disabled={isCardWithImagesSelected}
        style={{
          paddingLeft: 16,
          paddingRight: 16,
        }}
        onClick={() => {
          setImagePosition(position)
          trackAction('imagePosition', position)
        }}
      >
        {imagePositionIcons[position] ? <ListItemIcon>{imagePositionIcons[position]}</ListItemIcon> : <ListItemIcon />}
        <FormattedMessage id={`toolbarMenu.imagePositions.titles.${position}`} />
      </MenuItem>
    ))}
  </MenuList>
)

const VerticalFileMenu = ({classes, handleOpenFileDialog, deleteFile, lastSelectedNode}) => (
  <MenuList>
    <MenuItem
      className={classes.listItem}
      onClick={() => {
        handleOpenFileDialog()
      }}
      style={{
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <ListItemIcon>
        <AttachFileIcon fontSize="small" />
      </ListItemIcon>
      <FormattedMessage id="toolbarMenuFile" />
    </MenuItem>
    <MenuItem
      onClick={deleteFile}
      disabled={!lastSelectedNode || !lastSelectedNode.file}
      className={classes.listItem}
      style={{
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <ListItemIcon>
        <DeleteIcon fontSize="small" />
      </ListItemIcon>
      <FormattedMessage id="toolbarMenuFileDelete" />
    </MenuItem>
  </MenuList>
)

const VerticalTemplateMenu = ({classes, disableCreateTemplate, openDialog}) => {
  const interactionManager = useInteractionManager(false)
  const onTemplateSelected = template => {
    const node = interactionManager.lastSelectedNode
    interactionManager.addDispatch(addTemplate(node, template))
    interactionManager.saveNodes()
    interactionManager.commitDispatches()
    interactionManager.nodeGrow(node)
  }
  return (
    <MenuList>
      <MenuItem
        className={classes.listItem}
        key="templateInsert"
        onClick={() => {
          openDialog(TemplateInsertDialog(onTemplateSelected))
        }}
        style={{
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <FormattedMessage id="templateInsert" />
        ...
      </MenuItem>
      <MenuItem
        className={classes.listItem}
        disabled={disableCreateTemplate}
        key="templateCreate"
        onClick={() => {
          openDialog(TemplateCreateDialog)
        }}
        style={{
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <FormattedMessage id="templateCreate" />
        ...
      </MenuItem>
    </MenuList>
  )
}

export const ImageMenu = ({
  open,
  setOpen,
  handleOpenFileDialog,
  handleClose,
  description = '',
  contentType = 'image',
  placement = 'bottom',
  verticalMenu = false,
  splitButton = false,
  openOnlyOnClick = false,
  buttonClassName,
}) => {
  const {deleteImage, setImagePosition, deleteFile, reorgNodes} = useEngineControl()
  const {selectedNodes, selectedEdges} = useInteractionManager()

  const openDialog = useDialog()

  let disabled // test
  switch (contentType) {
    case 'image':
    case 'file':
      disabled =
        (![...selectedNodes].find(({isRoot}) => !isRoot) && selectedEdges.size === 0) || selectedNodes.size === 0
      break
    case 'template':
      disabled = selectedEdges.size > 0 || selectedNodes.size === 0
      break
    case 'reorganize':
      disabled = selectedNodes.size === 0
      break
    default:
      disabled = false
  }

  const classes = useStyles()
  const isCardWithImagesSelected = ![...selectedNodes].find(n => n.image)
  const imagePositionIcons = {
    body: undefined,
    crop: undefined,
    stretch: undefined,
    fullWidth: undefined,
  }

  const ContentIcons = {
    image: ImageIcon,
    file: InsertDriveFileIcon,
    template: undefined,
    reorganize: Dashboard,
  }

  return (
    <PopUpContainer
      Icon={ContentIcons[contentType] ? ContentIcons[contentType] : BrightnessIcon}
      disabled={disabled}
      open={open}
      setOpen={setOpen}
      description={description}
      placement={placement}
      splitButton={splitButton}
      splitButtonAction={handleOpenFileDialog}
      openOnlyOnClick={openOnlyOnClick}
      buttonClassName={buttonClassName}
    >
      {contentType === 'image' ? (
        verticalMenu ? (
          <VerticalMenu
            handleOpenFileDialog={handleOpenFileDialog}
            classes={classes}
            deleteImage={deleteImage}
            isCardWithImagesSelected={isCardWithImagesSelected}
            imagePositionIcons={imagePositionIcons}
            setImagePosition={setImagePosition}
          />
        ) : (
          <HorizontalMenu
            handleOpenFileDialog={handleOpenFileDialog}
            classes={classes}
            deleteImage={deleteImage}
            isCardWithImagesSelected={isCardWithImagesSelected}
            imagePositionIcons={imagePositionIcons}
            setImagePosition={setImagePosition}
          />
        )
      ) : null}

      {contentType === 'file' ? (
        <VerticalFileMenu
          handleOpenFileDialog={handleOpenFileDialog}
          classes={classes}
          deleteFile={deleteFile}
          lastSelectedNode={[...selectedNodes].pop()}
        />
      ) : null}
      {contentType === 'template' ? (
        <VerticalTemplateMenu
          handleOpenFileDialog={handleOpenFileDialog}
          classes={classes}
          deleteImage={deleteImage}
          isCardWithImagesSelected={isCardWithImagesSelected}
          disableCreateTemplate={selectedNodes.size !== 1}
          openDialog={openDialog}
        />
      ) : null}
      {contentType === 'reorganize' ? (
        <CardReorgMenu handleClose={handleClose} reorgNodes={reorgNodes} itemStyleClass={classes.listItem} />
      ) : null}
    </PopUpContainer>
  )
}
