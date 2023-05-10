import React from 'react'
import DialogContentText from '@material-ui/core/DialogContentText'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import {FormattedMessage, useIntl} from 'react-intl'

const AlertDialog = ({title, translationKey, open, onClose, onConfirm}) => {
  const {formatMessage} = useIntl()
  const message = formatMessage({id: translationKey})
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText dangerouslySetInnerHTML={{__html: message}} id="alert-dialog-description" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onConfirm} variant="contained" color="primary">
          <FormattedMessage id="OK" />
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AlertDialog
