import React from 'react'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import MobileDialog from './MobileDialog'

const SimpleDialog = ({fullScreen = false, title, text, children, open, onClose}) => (
  <MobileDialog
    open={open}
    onClose={onClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
    fullScreen={fullScreen}
  >
    <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">{text}</DialogContentText>
    </DialogContent>
    <DialogActions>{children}</DialogActions>
  </MobileDialog>
)

export default SimpleDialog
