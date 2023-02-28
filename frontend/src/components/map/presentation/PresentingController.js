import React, {useState} from 'react'
import makeStyles from '@material-ui/styles/makeStyles'
import Card from '@material-ui/core/Card'
import IconButton from '@material-ui/core/IconButton'
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious'
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import SkipNextIcon from '@material-ui/icons/SkipNext'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Slide from '@material-ui/core/Slide'

import Backdrop from '@material-ui/core/Backdrop'
import PresentDialog from './PresentDialog'
import useMapStore from '../../../hooks/useMapStore'

// ToDo: State for selected Path and dleete and update
const useStyles = makeStyles(theme => ({
  root: {
    opacity: 0.75,
    display: 'flex',
    position: 'fixed',
    color: 'white',
    backgroundColor: 'black',
    right: 0,
    bottom: 0,
    borderRadius: 0,
    width: '100%',
  },
  backdrop: {
    zIndex: theme.zIndex.tooltip + 1,
    color: '#a70808',
    backgroundColor: '#66000000',
  },
  controls: {
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(2),
  },
  playIcon: {
    color: 'white',
    height: 38,
    width: 38,
  },
  paper: {
    opacity: 0.75,
    color: 'white',
    backgroundColor: 'black',
    position: 'fixed',
    right: 0,
    bottom: 0,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
    zIndex: theme.zIndex.tooltip + 1,
  },
  margin: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    color: 'white',
  },
  white: {
    color: 'white',
  },
  close: {
    marginLeft: 'auto',
    color: 'white',
  },
  eye: {
    marginRight: 'auto',
  },
}))

const PresentingController = ({
  presentMode,
  setPathMode,
  setHideController,
  hideController,
  allPaths,
  eventManager,
}) => {
  const classes = useStyles()

  const [selectedPathToPresent, setSelectedPathToPresent] = useState(null)
  const [checkedAutoPlay, setCheckedAutoPlay] = useState(false)
  const [pathIndex, setPathIndex] = useState(1)
  const [hidden, setHidden] = useState(true)
  const [openBackDrop] = useState(presentMode)
  const [firstStep, setFirstStep] = useState(true)
  const {nodes} = useMapStore()

  const [playTime, setPlayTime] = useState(1)
  // Todo: Stop while playing

  // ToDo: nodes length of the current selected Path
  const selectedPathLength = selectedPathToPresent?.nodes?.length

  const nodesSlides = selectedPathToPresent?.nodes

  const nextSlide = () => {
    if (pathIndex === selectedPathLength) {
      return
    }

    setPathIndex(i => i + 1)

    if (nodes[nodesSlides[pathIndex]]) {
      eventManager.zoomToNode(nodesSlides[pathIndex])
    }
  }

  const previousSlide = () => {
    if (pathIndex === 0) {
      return
    }

    setPathIndex(i => i - 1)

    if (nodes[nodesSlides[pathIndex - 2]]) {
      eventManager.zoomToNode(nodesSlides[pathIndex - 2])
    }
  }

  const handleCloseControllers = () => {
    setHideController(!hideController)
    setPathMode(false)
    setSelectedPathToPresent(null)
  }

  const presentingModeAutoPlay = () => {
    nodesSlides?.forEach((node, index) => {
      // eslint-disable-next-line func-names
      setTimeout(function () {
        if (nodes[node]) {
          eventManager.zoomToNode(node)
        }
        if (index === nodesSlides.length - 1) {
          handleCloseControllers()
        }
      }, playTime * index * 1000)
    })
  }

  const handleBackDropClick = () => {
    nextSlide()
  }

  return firstStep ? (
    <PresentDialog
      selectedPathToPresent={selectedPathToPresent}
      setFirstStep={setFirstStep}
      firstStep={firstStep}
      setPlayTime={setPlayTime}
      allPaths={allPaths}
      setSelectedPathToPresent={setSelectedPathToPresent}
      eventManager={eventManager}
      handleCloseControllers={handleCloseControllers}
      checkedAutoPlay={checkedAutoPlay}
      setCheckedAutoPlay={setCheckedAutoPlay}
      presentingModeAutoPlay={presentingModeAutoPlay}
    />
  ) : (
    <div>
      {hidden ? (
        <Backdrop className={classes.backdrop} open={openBackDrop} onClick={handleBackDropClick}>
          <Slide direction="left" in={presentMode} timeout={1000} mountOnEnter unmountOnExit>
            <Card elevation={10} className={classes.root} onClick={e => e.stopPropagation()}>
              <div className={classes.controls}>
                {!checkedAutoPlay ? (
                  <>
                    <IconButton
                      className={classes.eye}
                      size="small"
                      onClick={() => setHidden(!hidden)}
                      aria-label="previous"
                    >
                      <ChevronRightIcon fontSize="large" />
                    </IconButton>
                    <IconButton
                      size="small"
                      className={classes.close}
                      disabled={pathIndex === 1 || selectedPathLength === 0 || selectedPathToPresent == null}
                      onClick={previousSlide}
                      aria-label="previous"
                    >
                      <SkipPreviousIcon fontSize="large" />
                    </IconButton>
                    {selectedPathToPresent ? (
                      <Typography className={classes.white}>{`${pathIndex}-${selectedPathLength}`}</Typography>
                    ) : (
                      <Typography>-</Typography>
                    )}
                    <IconButton
                      size="small"
                      className={classes.white}
                      disabled={
                        pathIndex === selectedPathLength || selectedPathLength === 0 || selectedPathToPresent == null
                      }
                      onClick={nextSlide}
                      aria-label="next"
                    >
                      <SkipNextIcon fontSize="large" />
                    </IconButton>
                  </>
                ) : null}
              </div>
              <IconButton
                className={classes.close}
                size="small"
                onClick={() => handleCloseControllers()}
                aria-label="play/pause"
              >
                <HighlightOffIcon fontSize="large" />
              </IconButton>
            </Card>
          </Slide>
        </Backdrop>
      ) : (
        <Paper className={classes.paper} variant="elevation">
          <IconButton size="small" onClick={() => setHidden(!hidden)}>
            <KeyboardArrowLeftIcon fontSize="large" />
          </IconButton>
        </Paper>
      )}
    </div>
  )
}
export default PresentingController
