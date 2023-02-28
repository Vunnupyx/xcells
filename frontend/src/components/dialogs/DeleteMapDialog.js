import React from 'react'
import PropTypes from 'prop-types'
import {FormattedMessage} from 'react-intl'
import {useHistory} from 'react-router-dom'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContentText from '@material-ui/core/DialogContentText'
import Typography from '@material-ui/core/Typography'
import ErrorButton from '../wrapped/ErrorButton'

const DeleteMapDialog = ({mapId, open, onClose}) => {
  const {push} = useHistory()

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <FormattedMessage id="deleteMapDialogTitle" />
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography gutterBottom>
            <FormattedMessage id="deleteMapMessage" />
          </Typography>
          <Typography color="error">
            <FormattedMessage id="deleteMapWarning" />
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          <FormattedMessage id="buttonCancel" />
        </Button>
        <ErrorButton
          autoFocus
          onClick={() => {
            push(`/maps/${mapId}/delete`, {mapId})
            onClose()
          }}
        >
          <FormattedMessage id="deleteMapButtonOk" />
        </ErrorButton>
      </DialogActions>
    </Dialog>
  )
}

DeleteMapDialog.propTypes = {
  mapId: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default DeleteMapDialog
