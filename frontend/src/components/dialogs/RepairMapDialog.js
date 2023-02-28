import React from 'react'
import {useHistory} from 'react-router-dom'
import {FormattedMessage} from 'react-intl'

import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContentText from '@material-ui/core/DialogContentText'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import ErrorButton from '../wrapped/ErrorButton'

const RepairMapDialog = ({mapId, open, onClose}) => {
  const {push} = useHistory()

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <FormattedMessage id="dialog.repair.title" />
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography gutterBottom>
            <FormattedMessage id="dialog.repair.message" />
          </Typography>
          <Typography color="error">
            <FormattedMessage id="dialog.repair.warning" />
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="default">
          <FormattedMessage id="buttonCancel" />
        </Button>
        <ErrorButton
          autoFocus
          onClick={() => {
            push(`/maps/${mapId}/repair`, {mapId})
            onClose()
          }}
        >
          <FormattedMessage id="dialog.repair.buttonOk" />
        </ErrorButton>
      </DialogActions>
    </Dialog>
  )
}

export default RepairMapDialog
