import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Fab from '@material-ui/core/Fab'
import Add from '@material-ui/icons/Add'
import DirectionsWalk from '@material-ui/icons/DirectionsWalk'
import Info from '@material-ui/icons/Info'
import HomeRounded from '@material-ui/icons/HomeRounded'
import AccountBoxIcon from '@material-ui/icons/AccountBox'
import OndemandVideo from '@material-ui/icons/OndemandVideo'
import Public from '@material-ui/icons/Public'
import Box from '@material-ui/core/Box'
import useAuth from '../../../hooks/useAuth'
import Link from '../../wrapped/Link'

const appBarStyle = {bottom: 0, top: 'auto'}

const MobileAppBar = props => {
  const {login, isLoggedIn} = useAuth()

  return (
    <AppBar position="fixed" style={appBarStyle} {...props}>
      <Toolbar>
        {isLoggedIn ? (
          <>
            <IconButton component={Link} to="/maps">
              <HomeRounded />
            </IconButton>
            <Box flexGrow={1} />
            <IconButton component={Link} to="/maps/public">
              <Public />
            </IconButton>
            <Box flexGrow={1} />
            <Fab color="primary" component={Link} to="/maps/new" size="small">
              <Add />
            </Fab>
            <Box flexGrow={1} />
            <IconButton component={Link} to="/maps/tutorials">
              <OndemandVideo />
            </IconButton>
            <Box flexGrow={1} />
            <IconButton component={Link} to="/maps/get-started">
              <DirectionsWalk />
            </IconButton>
          </>
        ) : (
          <>
            <IconButton component={Link} to="/maps/public">
              <Public />
            </IconButton>
            <Box flexGrow={1} />
            <IconButton component={Link} to="/maps/tutorials">
              <OndemandVideo />
            </IconButton>
            <Box flexGrow={1} />
            <Fab color="primary" component={Link} onClick={login} size="small">
              <AccountBoxIcon />
            </Fab>
            <Box flexGrow={1} />
            <IconButton component={Link} to="/maps/get-started">
              <DirectionsWalk />
            </IconButton>
            <Box flexGrow={1} />
            <IconButton href="https://infinitymaps.io">
              <Info />
            </IconButton>
          </>
        )}
      </Toolbar>
    </AppBar>
  )
}
export default MobileAppBar
