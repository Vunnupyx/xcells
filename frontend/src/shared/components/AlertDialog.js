import React from 'react'
import {DialogContentText, Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core'
import Button from '@material-ui/core/Button'
import {FormattedMessage} from 'react-intl'

const AlertDialog = ({title, text, open, onClose, onConfirm}) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">{text}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onConfirm} variant="contained" color="primary">
        <FormattedMessage id="OK" />
      </Button>
    </DialogActions>
  </Dialog>
)

export default AlertDialog
