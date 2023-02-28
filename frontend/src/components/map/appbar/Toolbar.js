import React from 'react'
import MuiToolbar from '@material-ui/core/Toolbar'
import makeStyles from '@material-ui/styles/makeStyles'
import Paper from '@material-ui/core/Paper'
import clsx from 'clsx'

const useStyles = makeStyles(theme => ({
  paper: {
    background: theme.palette.background.paper,
    borderRadius: 10,
    boxShadow: theme.shadows[1],
    paddingRight: theme.spacing(0.5),
    paddingLeft: theme.spacing(0.5),
  },
}))

const Toolbar = ({children, paperClassName, ...props}) => {
  const classes = useStyles()
  return (
    <Paper className={clsx(paperClassName, classes.paper)}>
      <MuiToolbar variant="dense" disableGutters {...props}>
        {children}
      </MuiToolbar>
    </Paper>
  )
}

export default Toolbar
