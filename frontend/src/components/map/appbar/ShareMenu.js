import React from 'react'
import {FormattedMessage} from 'react-intl'

import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Menu from '@material-ui/core/Menu'
import Typography from '@material-ui/core/Typography'
import VisibilityIcon from '@material-ui/icons/Visibility'
import ShareIcon from '@material-ui/icons/Share'

import useDialog from '../../../hooks/useDialog'
import MapVisibilityDialog from '../../dialogs/MapVisibilityDialog'
import ShareMapWithDialog from '../../dialogs/ShareMapWithDialog'

const ShareMenu = ({presentMode, setPresentMode, pathMode, setPathMode, mapId, ...props}) => {
  const openDialog = useDialog()

  return (
    <Menu {...props}>
      <ListItem>
        <ListItemText>
          <Typography variant="h6" align="center">
            <FormattedMessage id="menuTitleShare" />
          </Typography>
        </ListItemText>
      </ListItem>
      <ListItem button onClick={() => openDialog(MapVisibilityDialog, {mapId})}>
        <ListItemIcon>
          <VisibilityIcon />
        </ListItemIcon>
        <ListItemText>
          <FormattedMessage id="menuVisibility" />
        </ListItemText>
      </ListItem>
      <ListItem button onClick={() => openDialog(ShareMapWithDialog, {mapId})}>
        <ListItemIcon>
          <ShareIcon />
        </ListItemIcon>
        <ListItemText>
          <FormattedMessage id="menuShare" />
        </ListItemText>
      </ListItem>
    </Menu>
  )
}

ShareMenu.propTypes = Menu.propTypes

export default ShareMenu
