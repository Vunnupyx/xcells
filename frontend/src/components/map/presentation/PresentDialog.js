import React from 'react'
import {makeStyles, withStyles} from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import MuiDialogTitle from '@material-ui/core/DialogTitle'
import MuiDialogContent from '@material-ui/core/DialogContent'
import MuiDialogActions from '@material-ui/core/DialogActions'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Typography from '@material-ui/core/Typography'
import Slide from '@material-ui/core/Slide'
import PathsAutoComplete from './Buttons/PathsAutoComplete'
import DialogItems from './DialogItems'

const styles = theme => ({
  root: {
    margin: 0,
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(5),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  dialog: {
    opacity: 0.5,
  },
})

const DialogTitle = withStyles(styles)(props => {
  const {children, classes, onClose, ...other} = props
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  )
})

const DialogContent = withStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent)

const DialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions)

const useStyles = makeStyles(theme => ({
  dialog: {
    opacity: 0.9,
    margin: theme.spacing(0),
  },
}))

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

export default function PresentDialog({
  selectedPathToPresent,
  setFirstStep,
  firstStep,
  setPlayTime,
  handleCloseControllers,
  allPaths,
  eventManager,
  setSelectedPathToPresent,
  checkedAutoPlay,
  setCheckedAutoPlay,
  presentingModeAutoPlay,
}) {
  const [open, setOpen] = React.useState(true)
  const classes = useStyles()

  const handleClose = () => {
    setOpen(false)
    setTimeout(async () => {
      handleCloseControllers()
    }, 300)
  }
  const handleSave = async () => {
    setOpen(false)
    await setTimeout(async () => {
      setFirstStep(!firstStep)
    }, 300)
    if (checkedAutoPlay) {
      presentingModeAutoPlay()
    }
  }

  return (
    <div>
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        TransitionComponent={Transition}
        transitionDuration={500}
        className={classes.dialog}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Presentation Mode
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            In this mode you can playback a previously recorded path, like a PowerPoint presentation.
          </Typography>
        </DialogContent>
        <DialogContent dividers>
          <Typography gutterBottom>You can select a path here:</Typography>
          <PathsAutoComplete
            allPaths={allPaths}
            eventManager={eventManager}
            setSelectedPathToPresent={setSelectedPathToPresent}
          />
        </DialogContent>
        <DialogContent dividers>
          <Typography gutterBottom>Set up path to run automaticlly?</Typography>
          <DialogItems
            checkedAutoPlay={checkedAutoPlay}
            setCheckedAutoPlay={setCheckedAutoPlay}
            setPlayTime={setPlayTime}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={selectedPathToPresent === null} autoFocus onClick={handleSave} color="primary">
            Start Presenting
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
