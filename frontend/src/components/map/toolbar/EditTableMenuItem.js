import React from 'react'
import {FormattedMessage} from 'react-intl'

import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import EditSharpIcon from '@material-ui/icons/EditSharp'

import useDialog from '../../../hooks/useDialog'
import useInteractionManager from '../../engine/useInteractionManager'
import EditTableDialog from '../../dialogs/EditTableDialog'

const EditTableMenuItem = () => {
  const {lastSelectedNode} = useInteractionManager()
  const openDialog = useDialog()

  const isDisable = !lastSelectedNode || lastSelectedNode.isRoot

  return (
    <MenuItem
      button
      disabled={isDisable}
      onClick={() => openDialog(EditTableDialog, {gridOptions: lastSelectedNode.gridOptions})}
    >
      <ListItemIcon>
        <EditSharpIcon />
      </ListItemIcon>
      <FormattedMessage id="toolbarMenu.editTable" />
    </MenuItem>
  )
}

export default EditTableMenuItem
