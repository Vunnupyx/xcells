import React from 'react'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import {FormattedMessage} from 'react-intl'
import ContactMailIcon from '@material-ui/icons/ContactMail'
import HomeIcon from '@material-ui/icons/Home'
import InfoIcon from '@material-ui/icons/Info'
import FeedbackIcon from '@material-ui/icons/Feedback'
import Logout from '@material-ui/icons/MeetingRoom'
import PublicIcon from '@material-ui/icons/Public'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import AccountBoxIcon from '@material-ui/icons/AccountBox'
import Menu from '@material-ui/core/Menu'

import useAuth from '../../../hooks/useAuth'
import UserAvatar from '../../UserAvatar'
import HiddenForGuest from '../../hide/HiddenForGuest'
import HiddenForUser from '../../hide/HiddenForUser'
import ListItemLink from '../../wrapped/ListItemLink'
import Link from '../../wrapped/Link'

const ProfileMenu = props => {
  const {auth, logout, login, signup} = useAuth()
  const username = auth?.wp_user?.data?.user_login || auth?.userId

  return (
    <Menu {...props}>
      <ListItem component="a" button href="https://infinitymaps.io/my-account/">
        <ListItemIcon>
          <UserAvatar userId={auth.userId} />
        </ListItemIcon>
        <ListItemText secondary={<FormattedMessage id="userPopoverManageAccount" />} primary={username} />
      </ListItem>
      <Divider />
      <HiddenForGuest>
        <ListItemLink to="/maps">
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary={<FormattedMessage id="mapListHome" />} />
        </ListItemLink>
        <Divider />

        <ListItem component="a" button href="https://infinitymaps.io/shop/">
          <ListItemIcon>
            <ArrowUpwardIcon />
          </ListItemIcon>
          <ListItemText primary={<FormattedMessage id="userPopoverUpgradeAccount" />} />
        </ListItem>
      </HiddenForGuest>
      <HiddenForUser>
        <ListItemLink to="/maps/public">
          <ListItemIcon>
            <PublicIcon />
          </ListItemIcon>
          <ListItemText primary={<FormattedMessage id="userPopoverAppMoreMaps" />} />
        </ListItemLink>

        <ListItem button onClick={signup}>
          <ListItemIcon>
            <ContactMailIcon />
          </ListItemIcon>
          <ListItemText primary={<FormattedMessage id="menuSignup" />} />
        </ListItem>
        <ListItem button onClick={login}>
          <ListItemIcon>
            <AccountBoxIcon />
          </ListItemIcon>
          <ListItemText primary={<FormattedMessage id="menuLogin" />} />
        </ListItem>
      </HiddenForUser>
      <ListItem button component={Link} to="/maps/feedback">
        <ListItemIcon>
          <FeedbackIcon />
        </ListItemIcon>
        <ListItemText primary={<FormattedMessage id="menuFeedback" />} />
      </ListItem>
      <ListItem button component="a" href="https://infinitymaps.io/en/site-notice/">
        <ListItemIcon>
          <InfoIcon />
        </ListItemIcon>
        <ListItemText primary={<FormattedMessage id="menuLegalNotice" />} />
      </ListItem>
      <HiddenForGuest>
        <Divider />
        <ListItem button onClick={logout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary={<FormattedMessage id="userPopoverLogOut" />} />
        </ListItem>
      </HiddenForGuest>
    </Menu>
  )
}

ProfileMenu.propTypes = Menu.propTypes

export default ProfileMenu
