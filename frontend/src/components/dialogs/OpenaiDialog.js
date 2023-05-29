import React, {useCallback} from 'react'
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
}))

const OpenaiDialog = ({open, onClose}) => {
  const classes = useStyles()

  const onSubmit = useCallback(() => {
    onClose()
  }, [onClose])

  return (
    <Dialog classes={{paper: classes.dialog}} open={open} onClose={onClose}>
      <Form
        onSubmit={onSubmit}
        render={({handleSubmit}) => (
          <form noValidate onSubmit={handleSubmit}>
            <DialogTitle>
              <FormattedMessage id="dialog.integration.title" />
              <IconButton aria-label="close" onClick={onClose} className={classes.closeButton}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container direction="column" justifyContent="center">
                <Grid item component={Box} maxWidth={250}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label={<FormattedMessage id="email" />}
                    name="email"
                    autoComplete="email"
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
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="version"
                    label={<FormattedMessage id="version" />}
                    id="version"
                    autoComplete="version"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button className={classes.button} type="submit" variant="contained" color="primary">
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
