import React from 'react'
import Box from '@material-ui/core/Box'
import Popover from '@material-ui/core/Popover'
import PopupState, {bindPopover, bindTrigger} from 'material-ui-popup-state'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import {FormattedMessage} from 'react-intl'
import IconButton from '@material-ui/core/IconButton'
import SettingsIcon from '@material-ui/icons/Settings'
import AppsIcon from '@material-ui/icons/Apps'
import Logout from '@material-ui/icons/MeetingRoom'
import makeStyles from '@material-ui/styles/makeStyles'
import UserAvatar from '../../UserAvatar'
import useAuth from '../../../hooks/useAuth'
import Link from '../../wrapped/Link'

const useStyles = makeStyles(() => ({
  box: {
    width: 250,
  },
}))

const UserPopover = () => {
  const classes = useStyles()
  const {userId, logout} = useAuth()

  return (
    <div>
      <PopupState variant="popover" popupId="user-popup-popover">
        {popupState => (
          <div>
            <IconButton size="small" color="primary" {...bindTrigger(popupState)}>
              <UserAvatar userId={userId} />
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
              <Box className={classes.box}>
                <List component="nav" aria-label="user popover list">
                  <ListItem component={Link} to="/settings" button>
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary={<FormattedMessage id="userPopoverSettings" />} />
                  </ListItem>
                  <ListItem component={Link} to="/settings/apps" button>
                    <ListItemIcon>
                      <AppsIcon />
                    </ListItemIcon>
                    <ListItemText primary={<FormattedMessage id="userPopoverAppsIntegrations" />} />
                  </ListItem>
                  <ListItem onClick={logout} button>
                    <ListItemIcon>
                      <Logout />
                    </ListItemIcon>
                    <ListItemText primary={<FormattedMessage id="userPopoverLogOut" />} />
                  </ListItem>
                </List>
              </Box>
            </Popover>
          </div>
        )}
      </PopupState>
    </div>
  )
}
export default UserPopover
