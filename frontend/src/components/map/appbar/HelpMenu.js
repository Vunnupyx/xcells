import React from 'react'
import {FormattedMessage} from 'react-intl'

import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Menu from '@material-ui/core/Menu'
import YouTubeIcon from '@material-ui/icons/YouTube'
import KeyboardIcon from '@material-ui/icons/Keyboard'
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk'
import ListItemIcon from '@material-ui/core/ListItemIcon'

import Typography from '@material-ui/core/Typography'
import Link from '../../wrapped/Link'
import {track} from '../../../contexts/tracking'

const HelpMenu = props => {
  return (
    <Menu {...props}>
      <ListItem>
        <ListItemText>
          <Typography variant="h6" align="center">
            <FormattedMessage id="menuTitleHelp" />
          </Typography>
        </ListItemText>
      </ListItem>
      <ListItem
        button
        onClick={() => {
          track({action: 'help', details: {method: 'getStarted'}})
        }}
        component={Link}
        to="/maps/get-started"
      >
        <ListItemIcon>
          <DirectionsWalkIcon />
        </ListItemIcon>
        <ListItemText>
          <FormattedMessage id="menuGetStarted" />
        </ListItemText>
      </ListItem>

      <ListItem
        button
        component="a"
        target="_blank"
        href="https://seed-earth-027.notion.site/Actions-Shortcuts-0058ba3efee541bd97731692f5cdac43"
        onClick={() => {
          track({action: 'help', details: {method: 'actionsAndShortcuts'}})
        }}
      >
        <ListItemIcon>
          <KeyboardIcon />
        </ListItemIcon>
        <ListItemText>
          <FormattedMessage id="menuMapInteractionHelp" />
        </ListItemText>
      </ListItem>

      <ListItem
        button
        onClick={() => {
          track({action: 'help', details: {method: 'tutorials'}})
        }}
        component={Link}
        to="/maps/tutorials"
      >
        <ListItemIcon>
          <YouTubeIcon />
        </ListItemIcon>
        <ListItemText>
          <FormattedMessage id="menuTutorials" />
        </ListItemText>
      </ListItem>
    </Menu>
  )
}

HelpMenu.propTypes = Menu.propTypes

export default HelpMenu
