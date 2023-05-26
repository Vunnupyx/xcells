import React, {useCallback, useState} from 'react'
import {Link as RouterLink, useParams} from 'react-router-dom'
import clsx from 'clsx'

import {createTheme as createMuiTheme, ThemeProvider as MuiThemeProvider} from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Hidden from '@material-ui/core/Hidden'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import makeStyles from '@material-ui/styles/makeStyles'
import MenuIcon from '@material-ui/icons/Menu'
import Grow from '@material-ui/core/Grow'
import SettingsIcon from '@material-ui/icons/Settings'
import IconButton from '@material-ui/core/IconButton'
import CloudDownloadIcon from '@material-ui/icons/CloudDownload'

import {FormattedMessage} from 'react-intl'
import Button from '@material-ui/core/Button'
import ShareIcon from '@material-ui/icons/Share'
import SearchIcon from '@material-ui/icons/Search'
import CancelIcon from '@material-ui/icons/Close'
import {TooltipWrapper} from './TooltopWrapper'
import SearchArea from './search/SearchArea'
import MapStorePulse from './MapStorePulse'
import Toolbar from './Toolbar'

import logo from '../../../assets/xcells_logo.png'
import logo_notext from '../../../assets/xcells_logo_no-text.png'
import config from '../../../styles/config'
import MapMenu from './MapMenu'
import HelpMenu from './HelpMenu'
import ProfileMenu from './ProfileMenu'
import HiddenReadOnly from '../../hide/HiddenReadOnly'
import SettingsMenu from './SettingsMenu'
import MapTitle from './MapTitle'
import CollaboratorsAvatars from '../collaboration/CollaboratorsAvatars'
import ShareMenu from './ShareMenu'
import ExportMenu from './ExportMenu'

const useStyles = makeStyles(theme => ({
  logo: {
    height: 30,
    verticalAlign: 'bottom',
  },
  marginLeftRight: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    padding: theme.spacing(1),
    paddingBottom: 0,
  },
  topSndBar: {
    position: 'absolute',
    top: 56,
    left: 0,
    alignItems: 'center',
    padding: theme.spacing(1),
    paddingBottom: 0,
  },
  pulse: {
    marginLeft: theme.spacing(1),
  },
  space: {
    flexGrow: 1,
    height: 0,
  },
  onTop: {
    zIndex: theme.zIndex.appBar,
  },
  searchArea: {
    width: 343,
  },
  general: {
    marginLeft: theme.spacing(1),
  },
  maxHeightToScreen: {
    maxHeight: window.innerHeight - 56 - 16,
  },
}))

const useMenuStyles = makeStyles({
  list: {
    minWidth: 250,
  },
})

const MENUS = {
  share: 'share',
  map: 'map',
  help: 'help',
  profile: 'profile',
  settings: 'settings',
  export: 'export',
}

const appBarTheme = createMuiTheme({
  ...config.mui,
  overrides: {
    ...config.mui.overrides,
    // give the icon buttons a smaller padding
    MuiIconButton: {
      root: {
        padding: 8,
      },
    },
    // give the toolbar a smaller padding, as we are using it as a float toolbar
    MuiToolbar: {
      gutters: {
        '@media (min-width:600px)': {
          paddingLeft: 8,
          paddingRight: 8,
        },
        paddingLeft: 8,
        paddingRight: 8,
      },
    },
  },
})

const SearchButton = ({searchOpen, setSearchVisible}) => {
  const Icon = searchOpen ? <CancelIcon /> : <SearchIcon />
  return (
    <IconButton
      onClick={() => {
        setSearchVisible(visible => !visible)
      }}
    >
      {Icon}
    </IconButton>
  )
}

const AppBar = ({presentMode, setPresentMode, pathMode, setPathMode, focusMode, searchOpen, setSearchVisible}) => {
  const classes = useStyles()
  const menuClasses = useMenuStyles()
  const {mapId} = useParams()

  const [openedMenu, setOpenedMenu] = useState()
  const [anchorEl, setAnchorEl] = useState()

  const openMenu = menuType => event => {
    setOpenedMenu(menuType)
    setAnchorEl(event.target)
  }

  const closeMenu = useCallback(() => {
    setOpenedMenu()
    setAnchorEl()
  }, [setOpenedMenu, setAnchorEl])

  return focusMode ? (
    <MuiThemeProvider theme={appBarTheme}>
      <Grid container className={classes.topBar}>
        <Grid item className={classes.onTop}>
          <Toolbar>
            <RouterLink to="/maps" className={classes.marginLeftRight}>
              <img alt="xCELLS Logo" className={classes.logo} src={logo_notext} />
            </RouterLink>
          </Toolbar>
        </Grid>
      </Grid>
    </MuiThemeProvider>
  ) : (
    <MuiThemeProvider theme={appBarTheme}>
      <Grid container className={classes.topBar}>
        <Hidden xsDown>
          <Grid item className={classes.onTop}>
            <Toolbar>
              <TooltipWrapper translationId="toolbarTooltipInfinityMapLogo">
                <RouterLink to="/maps" className={classes.marginLeftRight}>
                  <img alt="xCELLS Logo" className={classes.logo} src={logo} />
                </RouterLink>
              </TooltipWrapper>
              <TooltipWrapper translationId="toolbarTooltipMapName">
                <Grid item className={classes.marginLeftRight}>
                  <MapTitle />
                </Grid>
              </TooltipWrapper>
            </Toolbar>
          </Grid>
          <Hidden smDown>
            <Grid item className={classes.pulse}>
              <div className={classes.onTop}>
                <MapStorePulse />
              </div>
            </Grid>
          </Hidden>
          <Grid item className={classes.space} />
        </Hidden>

        <Grid item className={classes.onTop}>
          <Toolbar>
            <CollaboratorsAvatars />
            <SearchButton searchOpen={searchOpen} setSearchVisible={setSearchVisible} />
            <HiddenReadOnly>
              <TooltipWrapper translationId="toolbarTooltipShare">
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={openMenu(MENUS.share)}
                  style={{borderRadius: '6px'}}
                  startIcon={<ShareIcon />}
                >
                  <FormattedMessage id="toolbarButtonShare" />
                </Button>
              </TooltipWrapper>
              <TooltipWrapper translationId="toolbarTooltipExport">
                <IconButton onClick={openMenu(MENUS.export)}>
                  <CloudDownloadIcon />
                </IconButton>
              </TooltipWrapper>
              <ExportMenu
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                getContentAnchorEl={null}
                open={openedMenu === MENUS.export}
                TransitionComponent={Grow}
                onClose={closeMenu}
                onClick={closeMenu}
                disableRestoreFocus
              />
              <TooltipWrapper translationId="toolbarTooltipMapOptions">
                <IconButton onClick={openMenu(MENUS.map)}>
                  <MenuIcon />
                </IconButton>
              </TooltipWrapper>
              <ShareMenu
                classes={menuClasses}
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                getContentAnchorEl={null}
                open={openedMenu === MENUS.share}
                TransitionComponent={Grow}
                onClose={closeMenu}
                onClick={closeMenu}
                mapId={mapId}
                disableRestoreFocus
              />
              <MapMenu
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                getContentAnchorEl={null}
                classes={menuClasses}
                anchorEl={anchorEl}
                open={openedMenu === MENUS.map}
                TransitionComponent={Grow}
                onClose={closeMenu}
                onClick={closeMenu}
                mapId={mapId}
                presentMode={presentMode}
                setPresentMode={setPresentMode}
                pathMode={pathMode}
                setPathMode={setPathMode}
                disableRestoreFocus
              />
            </HiddenReadOnly>
            <TooltipWrapper translationId="toolbarTooltipSettings">
              <IconButton onClick={openMenu(MENUS.settings)}>
                <SettingsIcon />
              </IconButton>
            </TooltipWrapper>
            <SettingsMenu
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              getContentAnchorEl={null}
              classes={menuClasses}
              anchorEl={anchorEl}
              open={openedMenu === MENUS.settings}
              TransitionComponent={Grow}
              onClose={closeMenu}
              onClick={closeMenu}
              disableRestoreFocus
            />
          </Toolbar>
        </Grid>
        <Grid item className={clsx(classes.general, classes.onTop)}>
          <Toolbar>
            <TooltipWrapper translationId="toolbarTooltipHelp">
              <IconButton onClick={openMenu(MENUS.help)}>
                <HelpOutlineIcon />
              </IconButton>
            </TooltipWrapper>
            <HelpMenu
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              getContentAnchorEl={null}
              classes={menuClasses}
              anchorEl={anchorEl}
              open={openedMenu === MENUS.help}
              TransitionComponent={Grow}
              onClose={closeMenu}
              onClick={closeMenu}
              disableRestoreFocus
            />
            <TooltipWrapper translationId="toolbarTooltipAccount">
              <IconButton onClick={openMenu(MENUS.profile)}>
                <AccountCircleIcon />
              </IconButton>
            </TooltipWrapper>
            <ProfileMenu
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              getContentAnchorEl={null}
              classes={menuClasses}
              anchorEl={anchorEl}
              open={openedMenu === MENUS.profile}
              TransitionComponent={Grow}
              onClose={closeMenu}
              onClick={closeMenu}
              disableRestoreFocus
            />
          </Toolbar>
        </Grid>
        <Hidden mdUp>
          <Grid item className={classes.pulse}>
            <div className={classes.onTop}>
              <MapStorePulse />
            </div>
          </Grid>
        </Hidden>
      </Grid>
      {searchOpen && (
        <Grid container className={clsx(classes.topSndBar, classes.maxHeightToScreen)}>
          <Grid item className={classes.space} />
          <Grid className={clsx(classes.onTop, classes.searchArea, classes.maxHeightToScreen)}>
            <Toolbar className={clsx(classes.maxHeightToScreen)}>
              <SearchArea setSearchVisible={setSearchVisible} />
            </Toolbar>
          </Grid>
        </Grid>
      )}
    </MuiThemeProvider>
  )
}

export default AppBar
