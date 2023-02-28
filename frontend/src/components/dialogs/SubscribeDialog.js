import React from 'react'
import {FormattedMessage} from 'react-intl'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogContent from '@material-ui/core/DialogContent'
import Link from '@material-ui/core/Link'

import HistoryBackButton from '../wrapped/HistoryBackButton'

const SubscribeDialog = ({open, onClose, children, buttons = <HistoryBackButton />}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>
      <FormattedMessage id="subscribeDialogTitle" />
    </DialogTitle>
    <DialogContent>
      <DialogContentText>{children}</DialogContentText>
    </DialogContent>
    <DialogActions>
      {buttons}
      <Link href="https://infinitymaps.io/shop/">
        <Button color="primary" autoFocus>
          <FormattedMessage id="buttonSubscribe" />
        </Button>
      </Link>
    </DialogActions>
  </Dialog>
)

export default SubscribeDialog
