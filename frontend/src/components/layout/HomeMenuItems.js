import React from 'react'
import {FormattedMessage} from 'react-intl'
import {useRouteMatch} from 'react-router-dom'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import AddBox from '@material-ui/icons/AddBox'
import Backup from '@material-ui/icons/Backup'
import DirectionsWalk from '@material-ui/icons/DirectionsWalk'
import Error from '@material-ui/icons/Error'
import Feedback from '@material-ui/icons/Feedback'
import Info from '@material-ui/icons/Info'
import HomeRounded from '@material-ui/icons/HomeRounded'
import OndemandVideo from '@material-ui/icons/OndemandVideo'
import Public from '@material-ui/icons/Public'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import MuiLink from '@material-ui/core/Link'
import BusinessCenterIcon from '@material-ui/icons/BusinessCenter'

import Version from '../Version'
import {ROLES} from '../../shared/config/constants'
import HiddenForOtherRoles from '../hide/HiddenForOtherRoles'
import ListItemLink from '../wrapped/ListItemLink'
import Link from '../wrapped/Link'
import NewMapDialog from './NewMapDialog'

const elementsTop = [
  {
    text: <FormattedMessage id="drawerMyMaps" />,
    Icon: HomeRounded,
    to: '/maps',
  },
  {
    text: <FormattedMessage id="drawerCommunity" />,
    Icon: Public,
    to: '/maps/public',
  },
  {
    text: <FormattedMessage id="drawerImportMaps" />,
    Icon: Backup,
    to: '/maps/import',
  },
]

const WhiteListItemIcon = props => <ListItemIcon style={{color: 'white'}} {...props} />

const NavListItemLink = ({to, children, ...props}) => {
  const {path, isExact} = useRouteMatch()
  return (
    <ListItemLink component={Link} key={to} to={to} selected={isExact && path === to} {...props}>
      {children}
    </ListItemLink>
  )
}

const HomeMenuItems = ({open, setOpen}) => (
  <>
    <Grid item component={Box} flexGrow={1}>
      <List>
        {elementsTop.map(({to, Icon, text}) => (
          <NavListItemLink component={Link} key={to} to={to}>
            <WhiteListItemIcon>
              <Icon />
            </WhiteListItemIcon>
            <ListItemText primary={text} />
          </NavListItemLink>
        ))}
        <ListItem
          button
          onClick={() => {
            setOpen(!open)
          }}
        >
          <WhiteListItemIcon>
            <AddBox />
          </WhiteListItemIcon>
          <ListItemText primary={<FormattedMessage id="drawerCreateMap" />} />
        </ListItem>
        <NewMapDialog open={open} setOpen={setOpen} />

        <HiddenForOtherRoles roles={[ROLES.administrator]}>
          <Divider variant="middle" />
          <NavListItemLink to="/maps/admin/errors">
            <WhiteListItemIcon>
              <Error />
            </WhiteListItemIcon>
            <ListItemText primary={<FormattedMessage id="errorList" />} />
          </NavListItemLink>
        </HiddenForOtherRoles>

        <HiddenForOtherRoles roles={[ROLES.administrator]}>
          <NavListItemLink to="/maps/admin/users">
            <WhiteListItemIcon>
              <BusinessCenterIcon />
            </WhiteListItemIcon>
            <ListItemText primary={<FormattedMessage id="adminList" />} />
          </NavListItemLink>
        </HiddenForOtherRoles>
      </List>
      <Divider />
    </Grid>

    <Grid item>
      <Divider />
      <List>
        <NavListItemLink to="/maps/get-started">
          <WhiteListItemIcon>
            <DirectionsWalk />
          </WhiteListItemIcon>
          <ListItemText primary={<FormattedMessage id="menuGetStarted" />} />
        </NavListItemLink>
        <NavListItemLink to="/maps/tutorials">
          <WhiteListItemIcon>
            <OndemandVideo />
          </WhiteListItemIcon>
          <ListItemText primary={<FormattedMessage id="drawerTutorial" />} />
        </NavListItemLink>
        <NavListItemLink to="/maps/feedback">
          <WhiteListItemIcon>
            <Feedback />
          </WhiteListItemIcon>
          <ListItemText primary={<FormattedMessage id="drawerFeedback" />} />
        </NavListItemLink>
        <ListItem button component={MuiLink} href="https://infinitymaps.io/en/site-notice/">
          <WhiteListItemIcon>
            <Info />
          </WhiteListItemIcon>
          <ListItemText primary={<FormattedMessage id="drawerAbout" />} />
        </ListItem>
        <Box mt={1} mr={1}>
          <Typography gutterBottom align="center">
            <Version />
          </Typography>
        </Box>
      </List>
    </Grid>
  </>
)

export default HomeMenuItems
