import React from 'react'
import Box from '@material-ui/core/Box'
import Popover from '@material-ui/core/Popover'
import PopupState, {bindPopover, bindTrigger} from 'material-ui-popup-state'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import {FormattedMessage} from 'react-intl'
import IconButton from '@material-ui/core/IconButton'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import InfoIcon from '@material-ui/icons/Info'
import FeedbackIcon from '@material-ui/icons/Feedback'
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
  const {userId, name, logout} = useAuth()

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
                <ListItem component="a" button href="https://infinitymaps.io/my-account/">
                  <ListItemIcon>
                    <UserAvatar userId={userId} />
                  </ListItemIcon>
                  <ListItemText secondary={<FormattedMessage id="userPopoverManageAccount" />} primary={name} />
                </ListItem>
                <Divider />
                <List component="nav" aria-label="user popover list">
                  <div />

                  <ListItem component="a" button href="https://infinitymaps.io/shop/">
                    <ListItemIcon>
                      <ArrowUpwardIcon />
                    </ListItemIcon>
                    <ListItemText primary={<FormattedMessage id="userPopoverUpgradeAccount" />} />
                  </ListItem>
                  <ListItem onClick={logout} button>
                    <ListItemIcon>
                      <Logout />
                    </ListItemIcon>
                    <ListItemText primary={<FormattedMessage id="userPopoverLogOut" />} />
                  </ListItem>

                  <Divider />
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
