import React, {useState} from 'react'
import clsx from 'clsx'
import {makeStyles, useTheme} from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Drawer from '@material-ui/core/Drawer'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import Toolbar from '@material-ui/core/Toolbar'
import Box from '@material-ui/core/Box'
import Hidden from '@material-ui/core/Hidden'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import useAuth from '../../hooks/useAuth'
import Logo from './appBar/Logo'
import LoggedInItems from './appBar/LoggedInItems'
import UserPopover from './appBar/UserPopover'
import LoggedOutItems from './appBar/LoggedOutItems'
import DrawerItems from './HomeMenuItems'
import MobileAppBar from './appBar/MobileAppBar'
import FeedbackButton from '../FeedbackButton'

const drawerWidth = 210

// Remember setting default background color in `frontend/src/styles/config.js` for avoiding scrolling bugs
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
  menuButton: {
    left: -20,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    zIndex: theme.zIndex.appBar - 1,
  },
  drawerPaper: {
    backgroundColor: '#46596a',
    color: 'white',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperOpen: {
    width: drawerWidth,
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
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

const HomePageLayout = ({children, toolbar = null, path}) => {
  const classes = useStyles()
  const {isLoggedIn} = useAuth()
  const theme = useTheme()
  const biggerThanLg = useMediaQuery(theme.breakpoints.up('lg'))
  const [forceOpen, setForceOpen] = React.useState(null)
  const [openNewMapDialog, setOpenNewMapDialog] = useState(false)

  const open = biggerThanLg || forceOpen

  return (
    <Box display="flex">
      <FeedbackButton />
      <AppBar variant="outlined" position="fixed" className={classes.appBar}>
        <Toolbar>
          <Hidden smDown>
            <Hidden lgUp>
              <IconButton aria-label="open drawer" onClick={() => setForceOpen(!open)} className={classes.menuButton}>
                <MenuIcon />
              </IconButton>
            </Hidden>
            <Logo />
            <Box flexGrow={1} />
            {toolbar}
            <Box flexGrow={1} />
            {isLoggedIn ? (
              <>
                <LoggedInItems />
                <UserPopover />
              </>
            ) : (
              <LoggedOutItems />
            )}
          </Hidden>
          <Hidden mdUp>
            <Logo />
            <Box flexGrow={1} />
            {isLoggedIn ? <UserPopover /> : <LoggedOutItems />}
          </Hidden>
        </Toolbar>
      </AppBar>

      <Hidden smDown>
        <Drawer
          variant="permanent"
          className={clsx(classes.drawer, {
            [classes.drawerPaperOpen]: open,
            [classes.drawerPaperClose]: !open,
          })}
          classes={{
            paper: clsx(classes.toolbarPadding, classes.drawerPaper, {
              [classes.drawerPaperOpen]: open,
              [classes.drawerPaperClose]: !open,
            }),
          }}
        >
          <DrawerItems path={path} open={openNewMapDialog} setOpen={setOpenNewMapDialog} />
        </Drawer>
      </Hidden>

      <Hidden mdUp>
        <MobileAppBar variant="outlined" className={classes.appBar} />
      </Hidden>

      <main className={clsx(classes.content, classes.toolbarPadding)}>
        <Box py={4} px={4} minHeight="100%">
          {children}
        </Box>
      </main>
    </Box>
  )
}
export default HomePageLayout
