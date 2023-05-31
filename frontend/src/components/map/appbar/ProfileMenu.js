import React from 'react'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import {FormattedMessage} from 'react-intl'
import Logout from '@material-ui/icons/MeetingRoom'
import Menu from '@material-ui/core/Menu'

import SettingsIcon from '@material-ui/icons/Settings'
import AppsIcon from '@material-ui/icons/Apps'
import useAuth from '../../../hooks/useAuth'
import Link from '../../wrapped/Link'

const ProfileMenu = props => {
  const {logout} = useAuth()

  return (
    <Menu {...props}>
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
    </Menu>
  )
}

ProfileMenu.propTypes = Menu.propTypes

export default ProfileMenu
