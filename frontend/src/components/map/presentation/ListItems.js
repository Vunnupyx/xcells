import React, {useState} from 'react'

import AirplayIcon from '@material-ui/icons/Airplay'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import QueueIcon from '@material-ui/icons/Queue'
import SlideshowIcon from '@material-ui/icons/Slideshow'
import List from '@material-ui/core/List'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItem from '@material-ui/core/ListItem'
import Collapse from '@material-ui/core/Collapse'
import makeStyles from '@material-ui/styles/makeStyles'
import {track} from '../../../contexts/tracking'

// Style for the submenu
const useStyles = makeStyles(() => ({
  nested: {
    paddingLeft: 30,
  },
  nestednested: {
    paddingLeft: 60,
  },
  nestedCollapse: {
    paddingLeft: 40,
  },
}))

/**
 * Dev mode submenu for a react <List>
 *
 * @returns {JSX.Element}
 */
const ListItems = ({setPresentMode, setPathMode}) => {
  const classes = useStyles()

  const [open, setOpen] = useState(false)
  const devmodeClick = event => {
    setOpen(s => !s)
    event.stopPropagation()
  }

  const handlePathsClick = () => {
    setPathMode(i => !i)
  }
  const handlePresentClick = () => {
    setPresentMode(i => !i)
  }

  return (
    <>
      <ListItem button onClick={devmodeClick}>
        <ListItemIcon>
          <AirplayIcon />
        </ListItemIcon>
        <ListItemText>Presentation Mode</ListItemText>
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem
            button
            className={classes.nested}
            onClick={() => {
              handlePathsClick()
              track({action: 'presentationMode', details: {interaction: 'create/edit'}})
            }}
          >
            <ListItemIcon>
              <QueueIcon />
            </ListItemIcon>
            <ListItemText>Create/ Edit Path</ListItemText>
          </ListItem>
          <ListItem
            button
            className={classes.nested}
            onClick={() => {
              handlePresentClick()
              track({action: 'presentationMode', details: {interaction: 'present'}})
            }}
          >
            <ListItemIcon>
              <SlideshowIcon />
            </ListItemIcon>
            <ListItemText>Present Path</ListItemText>
          </ListItem>
        </List>
      </Collapse>
    </>
  )
}

export default ListItems
