import React, {useState} from 'react'
import {FormattedMessage} from 'react-intl'
import Switch from '@material-ui/core/Switch'
import ListItemText from '@material-ui/core/ListItemText'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import IconButton from '@material-ui/core/IconButton'
import ListItem from '@material-ui/core/ListItem'

const Feature = ({featureState, setFeatureState, featureName, helpMessage}) => {
  const [help, setHelp] = useState(false)

  const featureStateClick = event => {
    setFeatureState(!featureState)
    event.stopPropagation()
  }

  const helpMessageClick = event => {
    setHelp(!help)
    event.stopPropagation()
  }

  return (
    <>
      <ListItem button onClick={featureStateClick}>
        <Switch checked={featureState} />
        <ListItemText>
          <FormattedMessage id={featureName} />
          <IconButton onClick={helpMessageClick}>
            <HelpOutlineIcon />
          </IconButton>
        </ListItemText>
      </ListItem>
      {help && (
        <ListItem>
          <ListItemText>
            <FormattedMessage id={helpMessage} />
          </ListItemText>
        </ListItem>
      )}
    </>
  )
}

export default Feature
