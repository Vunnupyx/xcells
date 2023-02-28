import React, {useCallback, useEffect, useState} from 'react'
import {withStyles} from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import MuiDialogTitle from '@material-ui/core/DialogTitle'
import MuiDialogActions from '@material-ui/core/DialogActions'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Grid from '@material-ui/core/Grid'
import {useLocalStorage} from 'react-use'
import {getUrlFlag, SKIP_ONBOARDING} from '../../utils/urlFlags'

const createDialogTitleStyles = theme => ({
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

const DialogTitle = withStyles(createDialogTitleStyles)(({children, classes, onClose, ...other}) => (
  <MuiDialogTitle disableTypography className={classes.root} {...other}>
    <Typography variant="h6">{children}</Typography>
    {onClose ? (
      <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
        <CloseIcon />
      </IconButton>
    ) : null}
  </MuiDialogTitle>
))

const DialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions)

const OnBoardingGifDisplay = ({gifs, showAgainStorage}) => {
  const [showAgain, setShowAgain] = useLocalStorage(showAgainStorage, true)
  const [open, setOpen] = useState(showAgain && gifs.length > 0)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (getUrlFlag(SKIP_ONBOARDING) === 'true') setOpen(false)
  }, [])

  const handleShow = useCallback(() => {
    setShowAgain(s => !s)
  }, [setShowAgain])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const handleNext = useCallback(() => {
    setIndex(i => (i >= gifs.length - 1 ? i : i + 1))
  }, [setIndex, gifs.length])

  const handleBack = useCallback(() => {
    setIndex(i => (i <= 0 ? i : i - 1))
  }, [setIndex])

  const isLast = index === gifs.length - 1
  const isFirst = index === 0

  const [maxWidth, setMaxWidth] = useState(500)
  useEffect(() => {
    const newMaxWidth = Math.max(...gifs.map(e => e?.width))
    setMaxWidth(newMaxWidth)
  }, [gifs])

  if (gifs.length === 0) return null

  return (
    <div>
      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          {gifs[index].title}
        </DialogTitle>

        <Box width={maxWidth} display="flex" justifyContent="center" alignItems="center">
          <img src={gifs[index].gif} alt={gifs[index].title} width={gifs[index].width} height={gifs[index].height} />
        </Box>

        <DialogActions>
          <Grid container direction="row" justifyContent="space-around" alignItems="center">
            <Grid item xs={4}>
              {gifs?.length > 1 ? (
                <Button
                  fullWidth
                  disabled={isFirst}
                  variant="contained"
                  autoFocus
                  onClick={handleBack}
                  color="secondary"
                >
                  Back
                </Button>
              ) : null}
            </Grid>
            <Grid item xs={4} />
            <Grid item xs={4}>
              {isLast ? (
                <Button fullWidth variant="contained" autoFocus onClick={handleClose} color="primary">
                  Close
                </Button>
              ) : (
                <Button fullWidth variant="contained" autoFocus onClick={handleNext} color="primary">
                  Next
                </Button>
              )}
            </Grid>
          </Grid>
        </DialogActions>
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
export default OnBoardingGifDisplay
