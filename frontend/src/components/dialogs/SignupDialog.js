import React, {useCallback} from 'react'
import {FormattedMessage} from 'react-intl'
import {Form} from 'react-final-form'
import {TextField} from 'mui-rff'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Link from '@material-ui/core/Link'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import makeStyles from '@material-ui/styles/makeStyles'
import useSnackbar from '../../hooks/useSnackbar'
import Version from '../Version'
import Copyright from '../Copyright'
import useApiMutation from '../../hooks/useApiMutation'
import isEmail from '../../utils/isEmail'
import isValidPassword from '../../utils/isValidPassword'
import AlertDialog from '../../shared/components/AlertDialog'

const useStyles = makeStyles(() => ({
  signIn: {
    marginLeft: 8,
    cursor: 'pointer',
  },
}))

const validate = values => {
  const errors = {}
  if (!values.username) {
    errors.username = <FormattedMessage id="usernameRequired" />
  }
  if (!values.mail) {
    errors.mail = <FormattedMessage id="emailRequired" />
  } else if (!isEmail(values.mail)) {
    errors.mail = <FormattedMessage id="invalidEmailAddress" />
  }
  if (!values.password) {
    errors.password = <FormattedMessage id="passwordRequired" />
  } else if (!isValidPassword(values.password)) {
    errors.password = <FormattedMessage id="invalidPassword" />
  }
  return errors
}

const SignupDialog = ({setAuth, refresh, open, onClose, onLogin, ...rest}) => {
  const classes = useStyles()
  const {error} = useSnackbar()

  const [sendSignup, {data: isSuccess}] = useApiMutation({
    url: '/auth/signup',
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

  if (isSuccess)
    return (
      <AlertDialog
        open={open}
        onClose={onClose}
        onConfirm={onClose}
        title={<FormattedMessage id="signupDialogTitle" />}
        translationKey="signupDialogMessage"
      />
    )

  return (
    <Dialog open={open} onClose={onClose} {...rest}>
      <Form
        onSubmit={signup}
        validate={validate}
        render={({handleSubmit, submitting}) => (
          <form noValidate onSubmit={handleSubmit}>
            <DialogTitle>
              <FormattedMessage id="signupTitle" />
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
                    id="mail"
                    label={<FormattedMessage id="email" />}
                    name="mail"
                    autoComplete="mail"
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
                </Grid>
                <Grid container direction="column" justifyContent="center" alignItems="center" spacing={2}>
                  <Grid item>
                    <Typography>
                      <FormattedMessage id="alreadyExistAccount" />
                      <Link className={classes.signIn} color="secondary" onClick={onLogin}>
                        <FormattedMessage id="loginTitle" />
                      </Link>
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Box mt={6}>
                      <Typography variant="body2" color="textSecondary" align="center">
                        Version <Version /> - <Copyright />
                      </Typography>
                    </Box>
                  </Grid>
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
