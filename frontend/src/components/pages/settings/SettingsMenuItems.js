import React from 'react'
import {FormattedMessage} from 'react-intl'
import {useRouteMatch} from 'react-router-dom'

import List from '@material-ui/core/List'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import PersonIcon from '@material-ui/icons/Person'
import AppsIcon from '@material-ui/icons/Apps'

import Box from '@material-ui/core/Box'
import {makeStyles} from '@material-ui/core/styles'
import ListItemLink from '../../wrapped/ListItemLink'
import Link from '../../wrapped/Link'

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: '#fff',
    borderRadius: theme.shape.borderRadius,
  },
  link: {
    borderRadius: 10,
  },
}))

const elementsTop = [
  {
    text: <FormattedMessage id="settingsLayout.profileSettings" />,
    Icon: PersonIcon,
    to: '/settings',
  },
  {
    text: <FormattedMessage id="settingsLayout.appsIntegrations" />,
    Icon: AppsIcon,
    to: '/settings/apps',
  },
]

const NavListItemLink = ({to, children, ...props}) => {
  const {path, isExact} = useRouteMatch()
  return (
    <ListItemLink component={Link} key={to} to={to} selected={isExact && path === to} {...props}>
      {children}
    </ListItemLink>
  )
}

const SettingsMenuItems = () => {
  const classes = useStyles()
  return (
    <Box py={2} px={2} className={classes.root}>
      <List>
        {elementsTop.map(({to, Icon, text}) => (
          <NavListItemLink className={classes.link} component={Link} key={to} to={to}>
            <ListItemIcon>
              <Icon />
            </ListItemIcon>
            <ListItemText primary={text} />
          </NavListItemLink>
        ))}
      </List>
    </Box>
  )
}

export default SettingsMenuItems
