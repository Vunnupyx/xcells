import React from 'react'
import {FormattedMessage} from 'react-intl'

import Button from '@material-ui/core/Button'

import PropTypes from 'prop-types'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import ListItem from '@material-ui/core/ListItem'
import DialogContentText from '@material-ui/core/DialogContentText'
import List from '@material-ui/core/List'
import MobileDialog from '../MobileDialog'

const PasteActionDialog = ({actionList, onActionSelected, open, onClose}) => {
  return (
    <MobileDialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogTitle style={{marginLeft: -10}}>
          <FormattedMessage id="pasteActionDialogTitle" />
        </DialogTitle>
        <DialogContentText style={{marginLeft: 15, marginTop: 0, marginBottom: 0}} align="left">
          <FormattedMessage id="pasteActionDialogMessage" />
        </DialogContentText>
        <List>
          {actionList.map((action, index) => (
            <ListItem
              button
              key={action}
              onClick={() => {
                onActionSelected(index)
                onClose()
              }}
            >
              <span>{action}</span>
            </ListItem>
          ))}
        </List>
        <DialogActions>
          <Button onClick={onClose} color="default">
            <FormattedMessage id="cancel" />
          </Button>
        </DialogActions>
      </DialogContent>
    </MobileDialog>
  )
}

PasteActionDialog.propTypes = {
  actionList: PropTypes.array.isRequired,
  onActionSelected: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default PasteActionDialog
