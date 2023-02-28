import React from 'react'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'

import makeStyles from '@material-ui/styles/makeStyles'

const useStyles = makeStyles(theme => ({
  button: {
    // borderRadius: theme.spacing(0),
    margin: theme.spacing(1),
  },
}))

const PathDrawerButtons = () => {
  const classes = useStyles()

  return (
    <Button variant="contained" color="primary" className={classes.button} startIcon={<AddIcon />}>
      Create new Path
    </Button>
  )
}
export default PathDrawerButtons
