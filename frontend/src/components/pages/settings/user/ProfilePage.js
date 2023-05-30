import React from 'react'
import {FormattedMessage} from 'react-intl'

import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import TextField from '@material-ui/core/TextField'
import makeStyles from '@material-ui/styles/makeStyles'
import useAuth from '../../../../hooks/useAuth'

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: '#fff',
    borderRadius: theme.shape.borderRadius,
  },
}))

const ProfilePage = () => {
  const {userId, userEmail} = useAuth()
  const classes = useStyles()

  return (
    <Box py={4} px={4} className={classes.root}>
      <Typography variant="h5" component="h2">
        <FormattedMessage id="profileSettings.editProfile" />
      </Typography>
      <Grid container direction="column">
        <Grid item component={Box} maxWidth={400}>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            InputProps={{readOnly: true}}
            label={<FormattedMessage id="profileSettings.username" />}
            defaultValue={userId}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            InputProps={{readOnly: true}}
            label={<FormattedMessage id="profileSettings.emailAddress" />}
            defaultValue={userEmail}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default ProfilePage
