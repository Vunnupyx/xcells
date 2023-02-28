import React, {useCallback} from 'react'
import {FormattedMessage} from 'react-intl'
import {Form} from 'react-final-form'
import {TextField} from 'mui-rff'

import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/styles/makeStyles'

import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import Link from '@material-ui/core/Link'
import Divider from '@material-ui/core/Divider'
import useSnackbar from '../../hooks/useSnackbar'
import Version from '../Version'
import Copyright from '../Copyright'
import useApiMutation from '../../hooks/useApiMutation'

const useStyles = makeStyles(theme => ({
  paper: {
    paddingTop: 5,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    borderRadius: 10,
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
}))

const LoginDialog = ({setAuth, refresh, open, onClose, ...rest}) => {
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
                    <Grid item xs>
                      <Link href="https://infinitymaps.io/my-account/lost-password/" variant="body2">
                        <FormattedMessage id="loginForgotPassword" />
                      </Link>
                    </Grid>
                    <Grid item>
                      <Divider variant="middle" />
                    </Grid>
                    <Grid item>
                      <Button
                        id="loginButtonRegister"
                        color="secondary"
                        variant="contained"
                        className={classes.signup}
                        href="https://infinitymaps.io/register/"
                      >
                        <FormattedMessage id="loginSignUp" />
                      </Button>
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
