import React from 'react'
import ErrorIcon from '@material-ui/icons/Error'
import makeStyles from '@material-ui/styles/makeStyles'
import Grid from '@material-ui/core/Grid'
import {FormattedMessage} from 'react-intl'

const useStyles = makeStyles(() => ({
  buttonContainer: {
    height: '100%',
  },
  icon: {
    fontSize: 250,
    color: '#999',
  },
}))

const NotFound = () => {
  const classes = useStyles()

  return (
    <Grid container direction="column" justifyContent="center" alignItems="center" className={classes.buttonContainer}>
      <Grid item>
        <ErrorIcon className={classes.icon} />
      </Grid>
      <Grid item>
        <FormattedMessage id="error404" />
      </Grid>
    </Grid>
  )
}

export default NotFound
