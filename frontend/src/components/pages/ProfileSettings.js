import React, {useCallback} from 'react'
import {FormattedMessage} from 'react-intl'

import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

import {TextField} from 'mui-rff'
import {Form} from 'react-final-form'
import makeStyles from '@material-ui/styles/makeStyles'
import useSnackbar from '../../hooks/useSnackbar'
import useApiMutation from '../../hooks/useApiMutation'
import useAuth from '../../hooks/useAuth'

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: '#fff',
    borderRadius: theme.shape.borderRadius,
  },
  button: {
    marginTop: 30,
  },
}))

const ProfileSettings = () => {
  const {userId} = useAuth()
  const classes = useStyles()
  const {success, error} = useSnackbar()

  const [sendProfile] = useApiMutation({
    url: '/user',
    onSuccess: () => {
      success(<FormattedMessage id="profileSettings.success" />)
    },
    onError: () => {
      error(<FormattedMessage id="profileSettings.unknown" />)
    },
  })

  const onSaveProfile = useCallback(
    formData => {
      sendProfile({body: JSON.stringify(formData)})
    },
    [sendProfile],
  )
  return (
    <Box py={4} px={4} className={classes.root}>
      <Typography variant="h5" component="h2">
        <FormattedMessage id="profileSettings.editProfile" />
      </Typography>
      <Form
        onSubmit={onSaveProfile}
        initialValues={{username: userId}}
        render={({handleSubmit, submitting}) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container direction="column">
              <Grid item component={Box} maxWidth={400}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="username"
                  label={<FormattedMessage id="profileSettings.username" />}
                  name="username"
                  autoComplete="username"
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  name="email"
                  label={<FormattedMessage id="profileSettings.emailAddress" />}
                  type="text"
                  id="email"
                  autoComplete="email"
                />
              </Grid>
              <Grid className={classes.button} item align="end">
                <Button type="submit" variant="contained" color="primary" disabled={submitting}>
                  <FormattedMessage id="profileSettings.applyChanges" />
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      />
    </Box>
  )
}

export default ProfileSettings
