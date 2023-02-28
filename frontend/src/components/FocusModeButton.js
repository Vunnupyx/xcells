import React from 'react'
import makeStyles from '@material-ui/styles/makeStyles'
import {createTheme as createMuiTheme, ThemeProvider as MuiThemeProvider} from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import Paper from '@material-ui/core/Paper'
import FocusModeIcon from '../icons/FocusModeIcon'
import Toolbar from './map/appbar/Toolbar'
import config from '../styles/config'
import {TooltipWrapper} from './map/appbar/TooltopWrapper'

const useStyles = makeStyles(theme => ({
  topBar: {
    position: 'absolute',
    top: '100%',
    transform: 'translate(0, -100%)',
    left: 0,
    alignItems: 'center',
    padding: theme.spacing(1),
    paddingBottom: 8,
    zIndex: theme.zIndex.appBar,
    color: '#fff',
  },
  paper: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
  },
  iconButton: {
    width: '100%',
    height: '100%',
  },
}))

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

const FocusModeButton = ({focusMode, toggleFocusMode}) => {
  const classes = useStyles()

  const handleClick = () => {
    toggleFocusMode()
  }

  return (
    <MuiThemeProvider theme={appBarTheme}>
      <Toolbar className={classes.topBar}>
        <Paper className={classes.paper}>
          <TooltipWrapper translationId="toolbarTooltipFocusMode">
            <IconButton
              onClick={handleClick}
              variant="contained"
              color={focusMode ? 'primary' : 'default'}
              className={classes.iconButton}
            >
              <FocusModeIcon />
            </IconButton>
          </TooltipWrapper>
        </Paper>
      </Toolbar>
    </MuiThemeProvider>
  )
}

export default FocusModeButton
