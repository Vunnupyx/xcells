import React from 'react'
import Box from '@material-ui/core/Box'
import IconButton from '@material-ui/core/IconButton'
import makeStyles from '@material-ui/styles/makeStyles'
import Paper from '@material-ui/core/Paper'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'
import Grid from '@material-ui/core/Grid'

const useStyles = makeStyles(theme => ({
  box: {
    padding: theme.spacing(1),
  },
  paper: {
    opacity: 0.6,
    backgroundColor: 'black',
    color: 'white',
    fontSize: '11px',
  },
  closeButtonContainer: {
    float: 'right',
  },
  closeButton: {
    color: 'white',
    size: 'small',
  },
  endBox: {
    clear: 'both',
  },
  dialog: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
    zIndex: theme.zIndex.appBar - 10,
  },
}))

const DevModeDialog = ({children, hide, width}) => {
  const classes = useStyles()

  return (
    <Grid item className={classes.dialog}>
      <Paper className={classes.paper} elevation={20} style={{width}}>
        <IconButton
          size="small"
          onClick={event => {
            hide()
            event.stopPropagation()
          }}
          aria-label="delete"
          className={classes.closeButtonContainer}
        >
          <CancelOutlinedIcon className={classes.closeButton} />
        </IconButton>
        <Box className={classes.box}>{children}</Box>
        <Box className={classes.endBox} />
      </Paper>
    </Grid>
  )
}

export default DevModeDialog
