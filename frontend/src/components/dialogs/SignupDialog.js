import React, {useCallback} from 'react'
import {FormattedMessage} from 'react-intl'
import {Form} from 'react-final-form'
import {TextField} from 'mui-rff'

import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import useSnackbar from '../../hooks/useSnackbar'
import Version from '../Version'
import Copyright from '../Copyright'
import useApiMutation from '../../hooks/useApiMutation'

const SignupDialog = ({setAuth, refresh, open, onClose, onLogin, ...rest}) => {
  const {error: errorSnackbar} = useSnackbar()

  const [sendSignup] = useApiMutation({
    url: '/auth/signup',
    onSuccess: () => {
      refresh()
    },
    onError: error => {
      const {status, message} = error
      if (status === 401) {
        errorSnackbar(<FormattedMessage id="errorEmailExists" />)
      } else if (message) {
        errorSnackbar(message)
      } else {
        errorSnackbar(<FormattedMessage id="errorUnknown" />)
      }
    },
  })

  const signup = useCallback(
    formData => {
      sendSignup({body: JSON.stringify(formData)})
      onClose()
    },
    [sendSignup, onClose],
  )

  return (
    <Dialog open={open} onClose={onClose} {...rest}>
      <Form
        onSubmit={signup}
        render={({handleSubmit, submitting}) => (
          <form noValidate onSubmit={handleSubmit}>
            <DialogTitle>
              <FormattedMessage id="signupTitle" />
            </DialogTitle>
            <DialogContent>
              <Grid container direction="column" justify="center" alignItems="center">
                <Grid item>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label={<FormattedMessage id="loginUsername" />}
                    name="username"
                    autoComplete="username"
                    autoFocus
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                  />
                  <Grid container direction="column" justify="center" alignItems="center">
                    <Button id="loginButtonRegister" color="secondary" variant="contained" onClick={onLogin}>
                      <FormattedMessage id="loginTitle" />
                    </Button>
                  </Grid>
                </Grid>
                <Grid item>
                  <Box mt={8}>
                    <Typography variant="body2" color="textSecondary" align="center">
                      Version <Version /> - <Copyright />
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} color="default">
                <FormattedMessage id="buttonCancel" />
              </Button>
              <Button id="loginButtonSubmit" type="submit" color="primary" disabled={submitting}>
                <FormattedMessage id="createAccount" />
              </Button>
            </DialogActions>
          </form>
        )}
      />
    </Dialog>
  )
}

export default SignupDialog
