import React from 'react'
import Button from '@material-ui/core/Button'
import DeleteIcon from '@material-ui/icons/Delete'

import makeStyles from '@material-ui/styles/makeStyles'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContentText from '@material-ui/core/DialogContentText'

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(3),
  },
}))

const DeleteButton = ({deletePath, handleBack, editingPath}) => {
  const classes = useStyles()

  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleRemovePath = async () => {
    await deletePath(editingPath.id)
    handleBack()
  }

  const handleClose = () => {
    setOpen(false)
    handleRemovePath()
  }

  return (
    <>
      <Button
        onClick={handleClickOpen}
        size="small"
        variant="outlined"
        color="secondary"
        className={classes.button}
        startIcon={<DeleteIcon />}
      >
        Delete this path
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{`Delete ${editingPath?.title}`}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you really want to delte this path? This step can not be undone
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(!open)} color="primary">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleClose} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
export default DeleteButton
