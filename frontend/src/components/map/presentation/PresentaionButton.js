import React from 'react'
import QueueIcon from '@material-ui/icons/Queue'
import SlideshowIcon from '@material-ui/icons/Slideshow'
import makeStyles from '@material-ui/styles/makeStyles'
import IconButton from '@material-ui/core/IconButton'
import Paper from '@material-ui/core/Paper'
import useEngine from '../../engine/useEngine'
import useInteractionManager from '../../engine/useInteractionManager'

const useStyles = makeStyles(theme => ({
  paper: {
    position: 'fixed',
    left: 0,
    bottom: 0,
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}))

const PresentationButtons = ({presentMode, setPresentMode, pathMode, setPathMode}) => {
  const classes = useStyles()
  const {root} = useEngine()
  const eventManager = useInteractionManager()

  const handlePresentClick = () => {
    setPresentMode(!presentMode)
  }
  const handlePathsClick = async () => {
    await setPathMode(!pathMode)
    eventManager.zoomToNode(root)
  }

  return (
    <div>
      <Paper className={classes.paper}>
        <IconButton onClick={() => handlePathsClick()}>
          <QueueIcon />
        </IconButton>
        <IconButton onClick={() => handlePresentClick()}>
          <SlideshowIcon />
        </IconButton>
      </Paper>
    </div>
  )
}
export default PresentationButtons
