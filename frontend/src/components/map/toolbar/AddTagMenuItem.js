import React from 'react'
import {FormattedMessage} from 'react-intl'

import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import LabelIcon from '@material-ui/icons/Label'

import ManageNodeTagsDialog from '../../dialogs/ManageNodeTagsDialog'
import useDialog from '../../../hooks/useDialog'
import useInteractionManager from '../../engine/useInteractionManager'

const AddTagMenuItem = () => {
  const {lastSelectedNode} = useInteractionManager()
  const openDialog = useDialog()

  const isDisable = !lastSelectedNode || lastSelectedNode.isRoot

  return (
    <MenuItem button disabled={isDisable} onClick={() => openDialog(ManageNodeTagsDialog)}>
      <ListItemIcon>
        <LabelIcon />
      </ListItemIcon>
      <FormattedMessage id="toolbarMenu.manageTags" />
    </MenuItem>
  )
}

export default AddTagMenuItem
