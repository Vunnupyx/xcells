import React, {useCallback} from 'react'
import {FormattedMessage} from 'react-intl'
import {Form} from 'react-final-form'
import {TextField} from 'mui-rff'
import {Typography, Grid, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core'
import useSnackbar from '../../hooks/useSnackbar'
import Version from '../Version'
import Copyright from '../Copyright'
import useApiMutation from '../../hooks/useApiMutation'

const SignupDialog = ({setAuth, refresh, open, onClose, onLogin, ...rest}) => {
  const {success, error} = useSnackbar()

  const [sendSignup] = useApiMutation({
    url: '/auth/signup',
    onSuccess: () => {
      success(<FormattedMessage id="signupSuccess" />)
      onLogin()
    },
    onError: err => {
      const {message} = err
      if (message) {
        error(message)
      } else {
        error(<FormattedMessage id="errorServer" />)
      }
    },
  })

  const signup = useCallback(
    formData => {
      sendSignup({body: JSON.stringify(formData)})
    },
    [sendSignup],
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
                    id="mail"
                    label={<FormattedMessage id="loginMail" />}
                    name="mail"
                    autoComplete="mail"
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
