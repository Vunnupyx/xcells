import React from 'react'

import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import makeStyles from '@material-ui/styles/makeStyles'
import Grid from '@material-ui/core/Grid'
import Chip from '@material-ui/core/Chip'

import PanToolIcon from '@material-ui/icons/PanTool'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import DeleteIcon from '@material-ui/icons/Delete'
import AddBoxIcon from '@material-ui/icons/AddBox'
import CallMadeIcon from '@material-ui/icons/CallMade'
import MenuIcon from '@material-ui/icons/Menu'

import Modal from '@material-ui/core/Modal'
import AspectRatioInIcon from '../icons/AspectRatioIn'
import {isMac} from '../utils/browserDetection'
import {useExperimentalFeaturesContext} from '../hooks/useExperimentalFeatures'

const useStyles = makeStyles(theme => ({
  action: {
    float: 'right',
    background: theme.palette.info.light,
    marginLeft: 5,
  },
  modal: {
    backgroundColor: theme.palette.background.paper,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    position: 'absolute',
    maxWidth: '1600px',
    width: '90%',
    maxHeight: '100%',
    overflowY: 'scroll',
    flexGrow: 1,
    zIndex: theme.zIndex.appBar + 10,
  },
  topic: {
    padding: '0.33em',
  },
  container: {
    background: theme.palette.grey[300],
    padding: '1em',
  },
  item: {
    padding: '1.5em',
  },
}))

const HelpTopic = ({children}) => {
  const classes = useStyles()

  return (
    <Typography className={classes.topic} variant="h2">
      {children}
    </Typography>
  )
}

const TopicContainer = ({children}) => {
  const classes = useStyles()

  return (
    <Grid item container className={classes.container}>
      {children}
    </Grid>
  )
}

const HelpItem = ({children}) => {
  const classes = useStyles()

  return (
    <Grid item xs={12} md={4} lg={4} spacing={5}>
      <Paper className={classes.item}>{children}</Paper>
    </Grid>
  )
}

const HelpItemTopic = ({children}) => (
  <Typography gutterBottom variant="h5">
    {children}
  </Typography>
)

const HelpContent = ({children}) => <Typography>{children}</Typography>

const HelpRow = ({children}) => (
  <Grid justifyContent="flex-start" container direction="row" spacing={3}>
    {children}
  </Grid>
)

const KeyboardAction = ({children}) => {
  const classes = useStyles()

  return <Chip className={classes.action} label={children} />
}

const Ctrl = () => {
  return isMac ? '⌘' : 'Ctrl'
}

const HelpModal = ({open, onClose, ...props}) => {
  const classes = useStyles()

  const {advancedNavigation} = useExperimentalFeaturesContext()

  return (
    <Modal open={open} onClose={onClose} {...props}>
      <Paper className={classes.modal}>
        <TopicContainer>
          <HelpTopic>Navigate</HelpTopic>

          <HelpRow>
            <HelpItem>
              <KeyboardAction>Space</KeyboardAction>

              <HelpItemTopic>Zoom to card</HelpItemTopic>

              <HelpContent>Doubleclick.</HelpContent>
            </HelpItem>

            <HelpItem>
              <KeyboardAction>Esc</KeyboardAction>
              <HelpItemTopic>Zoom out one step</HelpItemTopic>
              <HelpContent>Doubleclick on surrounding card.</HelpContent>
            </HelpItem>

            <HelpItem>
              <KeyboardAction>
                <Ctrl /> + / -
              </KeyboardAction>
              <HelpItemTopic>Zoom freely</HelpItemTopic>
              <HelpContent>Pinch gesture / scroll gesture (two fingers on touchpad)</HelpContent>
            </HelpItem>

            <HelpItem>
              <HelpItemTopic>Look around (scroll / pan)</HelpItemTopic>
              <HelpContent>Drag map. (Scroll gesture, in some browsers.)</HelpContent>
            </HelpItem>

            {advancedNavigation && !isMac && (
              <HelpItem>
                <KeyboardAction>Shift + Wheel / Scroll</KeyboardAction>
                <HelpItemTopic>Move the scene</HelpItemTopic>
                <HelpContent>2 wheel mouse or 2 finger touchpad (on some devices)</HelpContent>
              </HelpItem>
            )}

            <HelpItem>
              <HelpItemTopic>Follow connections</HelpItemTopic>
              <HelpContent>Doubleclick arrows.</HelpContent>
            </HelpItem>
          </HelpRow>
        </TopicContainer>

        <TopicContainer>
          <HelpTopic>Select</HelpTopic>

          <HelpRow>
            <HelpItem>
              <HelpItemTopic>Select multiple cards</HelpItemTopic>
              <HelpContent>
                Select / deselect while holding the <Ctrl /> key.
              </HelpContent>
            </HelpItem>

            <HelpItem>
              <KeyboardAction>
                <Ctrl /> A
              </KeyboardAction>
              <HelpItemTopic>Select All sibling cards</HelpItemTopic>
            </HelpItem>
          </HelpRow>
        </TopicContainer>

        <TopicContainer>
          <HelpTopic>Edit</HelpTopic>

          <HelpRow>
            <HelpItem>
              <KeyboardAction>
                <Ctrl /> Enter
              </KeyboardAction>
              <KeyboardAction>Shift Enter</KeyboardAction>
              <HelpItemTopic>Create new card</HelpItemTopic>
              <HelpContent>
                Activate Add-Mode <AddBoxIcon fontSize="small" /> in Toolbar, select nearby existing cards, then click
                placeholder to create new child or sibling card.
              </HelpContent>
            </HelpItem>

            <HelpItem>
              <KeyboardAction>Alt</KeyboardAction>
              <HelpItemTopic>Move cards</HelpItemTopic>
              <HelpContent>
                Select card, then drag upper area. <br />
                Alternatively: Toggle move mode with <PanToolIcon fontSize="small" />.
              </HelpContent>
            </HelpItem>

            <HelpItem>
              <KeyboardAction>
                <Ctrl /> D
              </KeyboardAction>
              <HelpItemTopic>Duplicate card</HelpItemTopic>
              <HelpContent>
                Select card, then open the menu <MoreVertIcon fontSize="small" />
                in toolbar.
              </HelpContent>
            </HelpItem>

            <HelpItem>
              <KeyboardAction>Enter</KeyboardAction>
              <HelpItemTopic>Edit text</HelpItemTopic>
              <HelpContent>Select card and start typing. Just leave card or press Enter to save Text.</HelpContent>
            </HelpItem>

            <HelpItem>
              <HelpItemTopic>Change background / border color</HelpItemTopic>
              <HelpContent>Select card, choose color or border from tool bar.</HelpContent>
            </HelpItem>

            <HelpItem>
              <KeyboardAction>Del</KeyboardAction>
              <KeyboardAction>Backspace</KeyboardAction>
              <HelpItemTopic>Delete</HelpItemTopic>
              <HelpContent>
                Select card or connection, click <DeleteIcon fontSize="small" />.
              </HelpContent>
            </HelpItem>
          </HelpRow>
        </TopicContainer>

        <TopicContainer>
          <HelpTopic>Sizes</HelpTopic>

          <HelpRow>
            <HelpItem>
              <HelpItemTopic>Height / Width</HelpItemTopic>
              <HelpContent>Select card, drag bottom right triangle.</HelpContent>
            </HelpItem>

            <HelpItem>
              <KeyboardAction>
                <Ctrl /> Shift + / -
              </KeyboardAction>
              <HelpItemTopic>Size of children</HelpItemTopic>
              <HelpContent>
                Select parent card, then press Shift + drag triangle. Or click <AspectRatioInIcon fontSize="small" /> to
                scale down. (see menu <MoreVertIcon fontSize="small" /> to scale up).
              </HelpContent>
            </HelpItem>

            <HelpItem>
              <HelpItemTopic>Size of children (continuous)</HelpItemTopic>
              <HelpContent>
                Select parent card, then pres
                <Ctrl /> and drag triangle.
              </HelpContent>
            </HelpItem>
          </HelpRow>
        </TopicContainer>

        <TopicContainer>
          <HelpTopic>Connections</HelpTopic>
          <HelpRow>
            <HelpItem>
              <HelpItemTopic>Draw new connection</HelpItemTopic>
              <HelpContent>
                Select starting card, click <CallMadeIcon fontSize="small" /> in toolbar, then click destination card.
              </HelpContent>
            </HelpItem>

            <HelpItem>
              <HelpItemTopic>Show connections</HelpItemTopic>
              <HelpContent>Select cards – All in- and outgoing connections are shown.</HelpContent>
            </HelpItem>

            <HelpItem>
              <HelpItemTopic>Show all connections</HelpItemTopic>
              <HelpContent>
                Siehe <MoreVertIcon fontSize="small" /> Menü
              </HelpContent>
            </HelpItem>
          </HelpRow>{' '}
        </TopicContainer>

        <TopicContainer>
          <HelpTopic>Maps</HelpTopic>

          <HelpRow>
            {' '}
            <HelpItem>
              <HelpItemTopic>Create new map</HelpItemTopic>
              <HelpContent>
                Im <MenuIcon fontSize="small" /> Menü.
              </HelpContent>
            </HelpItem>
            <HelpItem>
              <HelpItemTopic>Share / unshare map</HelpItemTopic>
              <HelpContent>
                Im <MenuIcon fontSize="small" /> Menü.
              </HelpContent>
            </HelpItem>
            <HelpItem>
              <HelpItemTopic>Delete map</HelpItemTopic>
              <HelpContent>
                Im <MenuIcon fontSize="small" /> Menü.
              </HelpContent>
            </HelpItem>
          </HelpRow>
        </TopicContainer>
      </Paper>
    </Modal>
  )
}

export default HelpModal
