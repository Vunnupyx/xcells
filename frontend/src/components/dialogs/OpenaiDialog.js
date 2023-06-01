import React, {useCallback, useState} from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import {FormattedMessage} from 'react-intl'

import makeStyles from '@material-ui/styles/makeStyles'
import CloseIcon from '@material-ui/icons/Close'
import Box from '@material-ui/core/Box'
import IconButton from '@material-ui/core/IconButton'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import {TextField} from 'mui-rff'
import {Form} from 'react-final-form'
import {Configuration, OpenAIApi} from 'openai'
import Typography from '@material-ui/core/Typography'
import useApiMutation from '../../hooks/useApiMutation'
import useSnackbar from '../../hooks/useSnackbar'

const useStyles = makeStyles(theme => ({
  button: {
    textTransform: 'none',
    marginBottom: theme.spacing(1),
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
  },
  dialog: {
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  subtitle: {
    marginTop: 10,
  },
}))

const OPENAI_DEFAULT_MODEL = 'gpt-3.5-turbo'

const OpenaiDialog = ({initialOpenai, open, onClose}) => {
  const classes = useStyles()
  const [isLoading, setIsLoading] = useState(false)
  const {success, error} = useSnackbar()
  const [sendOpenai] = useApiMutation({
    url: '/integration/openai',
    method: 'put',
    onSuccess: () => success(<FormattedMessage id="dialog.integration.saveSuccess" />),
    onError: err => {
      const {message} = err
      if (message) {
        error(message)
      } else {
        error(<FormattedMessage id="errorServer" />)
      }
    },
  })

  const onSubmit = useCallback(
    formData => {
      setIsLoading(true)
      new OpenAIApi(
        new Configuration({
          apiKey: formData.apiKey,
        }),
      )
        .createChatCompletion({
          model: formData.model || OPENAI_DEFAULT_MODEL,
          messages: [{role: 'user', content: 'Hello!'}],
          user: formData.user,
          suffix: formData.suffix,
        })
        .then(() => {
          sendOpenai({body: formData})
          onClose()
        })
        .catch(err => {
          const {status} = err.response
          if (status === 401) {
            error(<FormattedMessage id="dialog.integration.authenticationError" />)
          } else if (status === 429) {
            error(<FormattedMessage id="dialog.integration.rateLimitExceeded" />)
          } else {
            error(<FormattedMessage id="dialog.integration.wrongRequest" />)
          }
          setIsLoading(false)
        })
    },
    [error, onClose, sendOpenai],
  )

  return (
    <Dialog classes={{paper: classes.dialog}} open={open} onClose={onClose}>
      <Form
        onSubmit={onSubmit}
        initialValues={initialOpenai}
        render={({handleSubmit}) => (
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              <FormattedMessage id="dialog.integration.title" />
              <IconButton aria-label="close" onClick={onClose} className={classes.closeButton}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container direction="column" justifyContent="center">
                <Grid item component={Box}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    id="apiKey"
                    label={<FormattedMessage id="dialog.integration.apiKey" />}
                    name="apiKey"
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    id="model"
                    label={<FormattedMessage id="dialog.integration.model" />}
                    name="model"
                    value={OPENAI_DEFAULT_MODEL}
                  />
                  <Typography className={classes.subtitle} variant="subtitle1" align="center">
                    <FormattedMessage id="dialog.integration.otherSettings" />
                  </Typography>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    name="user"
                    label={<FormattedMessage id="dialog.integration.user" />}
                    id="user"
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    name="suffix"
                    label={<FormattedMessage id="dialog.integration.suffix" />}
                    id="suffix"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button className={classes.button} type="submit" variant="contained" color="primary" disabled={isLoading}>
                <FormattedMessage id="save" />
              </Button>
            </DialogActions>
          </form>
        )}
      />
    </Dialog>
  )
}

export default OpenaiDialog
