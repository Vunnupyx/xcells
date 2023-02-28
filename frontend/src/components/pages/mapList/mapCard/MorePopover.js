import React from 'react'
import Popover from '@material-ui/core/Popover'
import PopupState, {bindPopover, bindTrigger} from 'material-ui-popup-state'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import {FormattedMessage} from 'react-intl'
import IconButton from '@material-ui/core/IconButton'
import CloudDownloadIcon from '@material-ui/icons/CloudDownload'
import DeleteIcon from '@material-ui/icons/Delete'

import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import VisibilityIcon from '@material-ui/icons/Visibility'
import UnfoldLessIcon from '@material-ui/icons/UnfoldLess'
import GroupAddIcon from '@material-ui/icons/GroupAdd'
import MapVisibilityDialog from '../../../dialogs/MapVisibilityDialog'
import {API_BASE_PATH} from '../../../../shared/config/constants'
import useDialog from '../../../../hooks/useDialog'
import RepairMapDialog from '../../../dialogs/RepairMapDialog'
import DeleteMapDialog from '../../../dialogs/DeleteMapDialog'
import ShareMapWithDialog from '../../../dialogs/ShareMapWithDialog'
import {trackAction} from '../../../../contexts/tracking'

const MorePopover = ({mapId}) => {
  const openDialog = useDialog()

  return (
    <PopupState variant="popover" popupId="card-popup-popover">
      {popupState => (
        <div>
          <IconButton size="small" {...bindTrigger(popupState)}>
            <MoreHorizIcon />
          </IconButton>

          <Popover
            {...bindPopover(popupState)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <List>
              <ListItem
                button
                onClick={() => {
                  openDialog(MapVisibilityDialog, {mapId})
                }}
                title={<FormattedMessage id="dialogMapPrivacyOpenerTitle" />}
              >
                <ListItemIcon>
                  <VisibilityIcon />
                </ListItemIcon>
                <ListItemText primary={<FormattedMessage id="menuVisibility" />} />
              </ListItem>

              <ListItem
                button
                onClick={() => {
                  openDialog(ShareMapWithDialog, {mapId})
                  trackAction('mapShareDialog')
                }}
                title={<FormattedMessage id="dialogMapPrivacyOpenerTitle" />}
              >
                <ListItemIcon>
                  <GroupAddIcon />
                </ListItemIcon>
                <ListItemText primary={<FormattedMessage id="menuShare" />} />
              </ListItem>

              <ListItem
                key="export"
                button
                component="a"
                href={`${API_BASE_PATH}/maps/${mapId}/export`}
                download
                onClick={() => trackAction('mapExport')}
              >
                <ListItemIcon>
                  <CloudDownloadIcon />
                </ListItemIcon>
                <ListItemText>
                  <FormattedMessage id="menuExportMap" />
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
                <ListItemText primary={<FormattedMessage id="menuDeleteMap" />} />
              </ListItem>

              <ListItem
                key="repair"
                button
                onClick={() => {
                  openDialog(RepairMapDialog, {mapId})
                  trackAction('mapRepair')
                }}
              >
                <ListItemIcon>
                  <UnfoldLessIcon />
                </ListItemIcon>
                <ListItemText>
                  <FormattedMessage id="menuRepairMap" />
                </ListItemText>
              </ListItem>
            </List>
          </Popover>
        </div>
      )}
    </PopupState>
  )
}
export default MorePopover
