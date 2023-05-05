import React, {useCallback} from 'react'
import {FormattedMessage} from 'react-intl'
import {Form} from 'react-final-form'
import {TextField} from 'mui-rff'
import {Box, Grid, Typography, Button, Link, Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core'
import makeStyles from '@material-ui/styles/makeStyles'
import useSnackbar from '../../hooks/useSnackbar'
import Version from '../Version'
import Copyright from '../Copyright'
import useApiMutation from '../../hooks/useApiMutation'

const useStyles = makeStyles(() => ({
  signup: {
    marginLeft: 8,
    cursor: 'pointer',
  },
}))

const LoginDialog = ({setAuth, refresh, open, onClose, onSignup, ...rest}) => {
  const classes = useStyles()
  const {error: errorSnackbar} = useSnackbar()

  const [sendLogin] = useApiMutation({
    url: '/auth',
    onSuccess: () => {
      refresh()
    },
    onError: error => {
      const {status, message} = error
      if (status === 401) {
        errorSnackbar(<FormattedMessage id="errorLogin" />)
      } else if (message) {
        errorSnackbar(message)
      } else {
        errorSnackbar(<FormattedMessage id="errorUnknown" />)
      }
    },
  })

  const login = useCallback(
    formData => {
      sendLogin({body: JSON.stringify(formData)})
      onClose()
    },
    [sendLogin, onClose],
  )

  return (
    <Dialog open={open} onClose={onClose} {...rest}>
      <Form
        onSubmit={login}
        render={({handleSubmit, submitting}) => (
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <DialogTitle>
              <FormattedMessage id="loginTitle" />
            </DialogTitle>
            <DialogContent>
              <Grid container direction="column" justifyContent="center" alignItems="center">
                <Grid item>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label={<FormattedMessage id="username" />}
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
                    label={<FormattedMessage id="password" />}
                    type="password"
                    id="password"
                    autoComplete="current-password"
                  />
                  <Grid container direction="column" justifyContent="center" alignItems="center">
                    <Grid item>
                      <Link href="https://infinitymaps.io/my-account/lost-password/" variant="body2">
                        <FormattedMessage id="loginForgotPassword" />
                      </Link>
                    </Grid>
                    <Grid item>
                      <Typography>
                        <FormattedMessage id="notRegistered" />
                        <Link color="secondary" className={classes.signup} onClick={onSignup}>
                          <FormattedMessage id="loginSignUp" />
                        </Link>
                      </Typography>
                    </Grid>
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
                <FormattedMessage id="loginTitle" />
              </Button>
            </DialogActions>
          </form>
        )}
      />
    </Dialog>
  )
}

export default LoginDialog
