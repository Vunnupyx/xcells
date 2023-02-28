import React, {useEffect, useState} from 'react'
import {useLocalStorage} from 'react-use'
import {withStyles} from '@material-ui/core/styles'
import Checkbox from '@material-ui/core/Checkbox'
import Dialog from '@material-ui/core/Dialog'
import MuiDialogTitle from '@material-ui/core/DialogTitle'
import MuiDialogContent from '@material-ui/core/DialogContent'
import MuiDialogActions from '@material-ui/core/DialogActions'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import {useHistory} from 'react-router-dom'
import useApi from '../../hooks/useApi'
import useAuth from '../../hooks/useAuth'
import NewMapCard from './NewMapCard'
import yourOwnMapPng from '../../assets/YourOwnMap.png'
import howToGetStartedPng from '../../assets/HowToGetStarted.png'
import yourOwnMapJson from '../../assets/YourOwnMap.json'
import howToGetStartedJson from '../../assets/HowToGetStarted.json'
import {track} from '../../contexts/tracking'

const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
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

const NewMapDialog = ({open, setOpen}) => {
  const api = useApi()
  const {isLoggedIn} = useAuth()

  const {push} = useHistory()
  const [showAgain, setShowAgain] = useLocalStorage('newMap.showAgain', true)
  const [openEmpty, setOpenEmpty] = useState(false)

  useEffect(() => {
    if (open && !showAgain) {
      push('/maps/new')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!isLoggedIn && open) {
      push('/maps/new')
    }
  }, [isLoggedIn, open, push])

  const handleClose = () => {
    setOpen(false)
  }
  const handleShow = () => {
    setShowAgain(!showAgain)
  }

  const handleHowToGetStartedClick = async () => {
    setOpen(false)
    const url = '/maps/import'
    const {mapId} = await api.post(url, {body: howToGetStartedJson, params: {filename: 'HowToGetStarted'}})
    push(`/maps/${mapId}`)
    track({action: 'mapCreate', details: {interaction: 'howToGetStarted'}})
  }

  const handleCreateYourOwnMapClick = async () => {
    setOpen(false)
    const url = '/maps/import'
    const {mapId} = await api.post(url, {body: yourOwnMapJson, params: {filename: 'CreateYourOwnMap'}})
    push(`/maps/${mapId}`)
    track({action: 'mapCreate', details: {interaction: 'yourOwnMap'}})
  }
  const handleEmptyEmptyClick = () => {
    push('/maps/new')
    track({action: 'mapCreate', details: {interaction: 'emptyMap'}})
  }
  const handleEmptyClose = () => {
    setOpenEmpty(false)
  }

  if (!isLoggedIn) return null

  return (
    <div>
      <Dialog fullWidth maxWidth="md" onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Create new map
        </DialogTitle>
        <DialogContent dividers>
          <Grid container direction="row" justifyContent="space-between" alignItems="center">
            <Grid item xs={4} align="center">
              <NewMapCard image={howToGetStartedPng} title="How to get started" onClick={handleHowToGetStartedClick} />
            </Grid>
            <Grid item xs={4} align="center">
              <NewMapCard image={yourOwnMapPng} title="Your own map" onClick={handleCreateYourOwnMapClick} />
            </Grid>
            <Grid item xs={4} align="center">
              <NewMapCard title="Empty Map" onClick={handleEmptyEmptyClick} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <FormControlLabel
            style={{marginRight: 'auto', paddingLeft: 10}}
            control={<Checkbox checked={!showAgain} onChange={handleShow} name="checkedA" />}
            label="Dont show this message again"
          />
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={handleEmptyClose}
        aria-labelledby="customized-dialog-title"
        open={openEmpty}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Create new map
        </DialogTitle>
        <DialogContent dividers>
          <Grid container direction="row" justifyContent="space-around" alignItems="center">
            <Grid item xs={4}>
              <NewMapCard title="Empty Map" onClick={handleEmptyEmptyClick} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <FormControlLabel
            style={{marginRight: 'auto', paddingLeft: 10}}
            control={<Checkbox checked={!showAgain} onChange={handleShow} />}
            label="Dont show this message again"
          />
        </DialogActions>
      </Dialog>
    </div>
  )
}
export default NewMapDialog
