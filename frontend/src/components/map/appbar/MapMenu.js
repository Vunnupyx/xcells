import React from 'react'
import {FormattedMessage} from 'react-intl'

import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import DeleteIcon from '@material-ui/icons/Delete'
import HistoryIcon from '@material-ui/icons/History'
import BuildIcon from '@material-ui/icons/Build'
import LabelIcon from '@material-ui/icons/Label'
import Typography from '@material-ui/core/Typography'
import Menu from '@material-ui/core/Menu'

import DeleteMapDialog from '../../dialogs/DeleteMapDialog'
import useDialog from '../../../hooks/useDialog'
import RepairMapDialog from '../../dialogs/RepairMapDialog'
import ListItems from '../presentation/ListItems'
import {track} from '../../../contexts/tracking'
import useMapStore from '../../../hooks/useMapStore'
import MapHistoryDialog from '../../dialogs/MapHistoryDialog'
import ManageTagsDialog from '../../dialogs/ManageTagsDialog'

const trackAction = action => track({action})

const MapMenu = ({presentMode, setPresentMode, pathMode, setPathMode, mapId, ...props}) => {
  const openDialog = useDialog()
  const store = useMapStore()

  return (
    <Menu {...props}>
      <ListItem>
        <ListItemText>
          <Typography variant="h6" align="center">
            <FormattedMessage id="menuTitleMap" />
          </Typography>
        </ListItemText>
      </ListItem>
      <ListItem button onClick={() => openDialog(ManageTagsDialog, {store})}>
        <ListItemIcon>
          <LabelIcon />
        </ListItemIcon>
        <ListItemText>
          <Typography>
            <FormattedMessage id="menu.tag.title" />
          </Typography>
        </ListItemText>
      </ListItem>
      <ListItems setPresentMode={setPresentMode} setPathMode={setPathMode} />
      <ListItem
        button
        onClick={() => {
          openDialog(RepairMapDialog, {mapId})
          trackAction('mapRepair')
        }}
      >
        <ListItemIcon>
          <BuildIcon />
        </ListItemIcon>
        <ListItemText>
          <FormattedMessage id="menuRepairMap" />
        </ListItemText>
      </ListItem>
      <ListItem
        button
        onClick={() => {
          openDialog(DeleteMapDialog, {mapId})
          trackAction('mapDeleteDialog')
        }}
      >
        <ListItemIcon>
          <DeleteIcon />
        </ListItemIcon>
        <ListItemText>
          <FormattedMessage id="menuDeleteMap" />
        </ListItemText>
      </ListItem>
      <ListItem
        button
        onClick={() => {
          openDialog(MapHistoryDialog, {store})
          trackAction('mapHistoryDialog')
        }}
      >
        <ListItemIcon>
          <HistoryIcon />
        </ListItemIcon>
        <ListItemText>
          <FormattedMessage id="menuMapHistory" />
        </ListItemText>
      </ListItem>
    </Menu>
  )
}

MapMenu.propTypes = Menu.propTypes

export default MapMenu
