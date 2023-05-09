import React from 'react'
import {DialogContentText, Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core'
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
