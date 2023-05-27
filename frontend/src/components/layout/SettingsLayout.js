import React, {useState} from 'react'
import clsx from 'clsx'
import {makeStyles} from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Box from '@material-ui/core/Box'
import {Container} from '@material-ui/core'
import useAuth from '../../hooks/useAuth'
import Logo from './appBar/Logo'
import UserPopover from './appBar/UserPopover'
import LoggedOutItems from './appBar/LoggedOutItems'
import SettingsMenuItems from './SettingsMenuItems'

const useStyles = makeStyles(theme => ({
  appBar: {
    margin: 0,
    padding: 0,
    backgroundColor: '#edf3fa',
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  toolbarPadding: {
    paddingTop: theme.mixins.toolbar.minHeight,
    '@media (min-width:0px) and (orientation: landscape)': {
      paddingTop: theme.mixins.toolbar['@media (min-width:0px) and (orientation: landscape)'].minHeight,
    },
    '@media (min-width:600px)': {
      paddingTop: theme.mixins.toolbar['@media (min-width:600px)'].minHeight,
    },
  },
  content: {
    height: '100vh',
    flexGrow: 1,
    position: 'relative',
  },
}))

const SettingsLayout = ({children, path}) => {
  const classes = useStyles()
  const {isLoggedIn} = useAuth()
  const [openNewMapDialog, setOpenNewMapDialog] = useState(false)

  return (
    <Container>
      <Box display="flex">
        <AppBar variant="outlined" position="fixed" className={classes.appBar}>
          <Toolbar>
            <Logo />
            <Box flexGrow={1} />
            {isLoggedIn ? <UserPopover /> : <LoggedOutItems />}
          </Toolbar>
        </AppBar>

        <aside className={classes.toolbarPadding}>
          <Box py={4} px={4} minHeight="100%">
            <SettingsMenuItems path={path} open={openNewMapDialog} setOpen={setOpenNewMapDialog} />
          </Box>
        </aside>

        <main className={clsx(classes.content, classes.toolbarPadding)}>
          <Box py={4} px={4} minHeight="100%">
            {children}
          </Box>
        </main>
      </Box>
    </Container>
  )
}
export default SettingsLayout
