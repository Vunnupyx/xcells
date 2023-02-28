import React from 'react'
import PropTypes from 'prop-types'
import {FormattedMessage} from 'react-intl'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContentText from '@material-ui/core/DialogContentText'
import Typography from '@material-ui/core/Typography'

const YesNoDialog = ({headlineId, questionId, yesTextId, noTextId, onYes, onNo, open, onClose}) => {
  const onConfirm = () => {
    onYes()
    onClose()
  }
  const onNotConfirm = () => {
    onNo()
    onClose()
  }
  return (
    <Dialog open={open} onClose={onNotConfirm}>
      <DialogTitle>
        <FormattedMessage id={headlineId} />
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography gutterBottom>
            <FormattedMessage id={questionId} />
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onNotConfirm}>
          <FormattedMessage id={noTextId} />
        </Button>
        <Button autoFocus onClick={onConfirm}>
          <FormattedMessage id={yesTextId} />
        </Button>
      </DialogActions>
    </Dialog>
  )
}

YesNoDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onYes: PropTypes.func.isRequired,
  onNo: PropTypes.func.isRequired,
  headlineId: PropTypes.string.isRequired,
  questionId: PropTypes.string.isRequired,
  yesTextId: PropTypes.string.isRequired,
  noTextId: PropTypes.string.isRequired,
}

export default YesNoDialog
