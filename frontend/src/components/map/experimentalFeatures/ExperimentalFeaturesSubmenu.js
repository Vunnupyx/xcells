import React, {useContext, useState} from 'react'
import {FormattedMessage, useIntl} from 'react-intl'

import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects'
import List from '@material-ui/core/List'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItem from '@material-ui/core/ListItem'
import Collapse from '@material-ui/core/Collapse'
import ListItemText from '@material-ui/core/ListItemText'
import MenuItem from '@material-ui/core/MenuItem'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import makeStyles from '@material-ui/styles/makeStyles'
import Feature from './Feature'
import {useExperimentalFeaturesContext} from '../../../hooks/useExperimentalFeatures'
import {track} from '../../../contexts/tracking'
import EngineOptionsContext from '../../engine/EngineOptionsContext'

// Style for the submenu
const useStyles = makeStyles(() => ({
  subMenu: {
    paddingLeft: 30,
  },
}))

/**
 * Additional menu for Experimental features
 * (useful for small amount of users, enabled individually)
 */
const ExperimentalFeaturesMenu = () => {
  const [open, setOpen] = useState(false)
  const {formatMessage} = useIntl()
  const classes = useStyles()

  const [options, setEngineOptions] = useContext(EngineOptionsContext)

  const {advancedNavigation, setAdvancedNavigation} = useExperimentalFeaturesContext()

  const experimentalModeClick = event => {
    setOpen(s => !s)
    event.stopPropagation()
  }

  return (
    <>
      <ListItem button onClick={experimentalModeClick}>
        <ListItemIcon>
          <EmojiObjectsIcon />
        </ListItemIcon>
        <ListItemText>
          <FormattedMessage id="experimentalModeMenuLabel" />
        </ListItemText>
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List className={classes.subMenu} component="div" disablePadding>
          <Feature
            featureState={advancedNavigation}
            setFeatureState={setAdvancedNavigation}
            featureName="experimentalAdvancedNavigation"
            helpMessage="experimentalAdvancedNavigationHelp"
          />
          <MenuItem>
            <FormControlLabel
              title={formatMessage({id: 'toolbarMenu.performanceMode.tooltip'})}
              labelPlacement="end"
              control={
                <Switch
                  value="unnecessary"
                  color="primary"
                  checked={options.performanceMode === 'low'}
                  onChange={() =>
                    setEngineOptions({
                      ...options,
                      performanceMode: options.performanceMode === 'default' ? 'low' : 'default',
                    })
                  }
                  onClick={() =>
                    track({action: 'togglePerformanceMode', details: {enabled: options.performanceMode !== 'low'}})
                  }
                />
              }
              label={<FormattedMessage id="toolbarMenu.performanceMode.label" />}
            />
          </MenuItem>
          <MenuItem>
            <FormControlLabel
              title={formatMessage({id: 'toolbarMenu.accessibility.tooltip'})}
              labelPlacement="end"
              control={
                <Switch
                  value="unnecessary"
                  color="primary"
                  checked={options.isAccessibilityEnabled}
                  onChange={() =>
                    setEngineOptions({
                      ...options,
                      isAccessibilityEnabled: !options.isAccessibilityEnabled,
                    })
                  }
                  onClick={() =>
                    track({action: 'toggleAccessibility', details: {enabled: !options.isAccessibilityEnabled}})
                  }
                />
              }
              label={<FormattedMessage id="toolbarMenu.accessibility.label" />}
            />
          </MenuItem>
          <MenuItem>
            <FormControlLabel
              title={formatMessage({id: 'toolbarMenu.pdfMetaData.tooltip'})}
              labelPlacement="end"
              control={
                <Switch
                  value="unnecessary"
                  color="primary"
                  checked={options.isPdfMetadataImportOptionEnabled}
                  onChange={() =>
                    setEngineOptions({
                      ...options,
                      isPdfMetadataImportOptionEnabled: !options.isPdfMetadataImportOptionEnabled,
                    })
                  }
                  onClick={() =>
                    track({
                      action: 'togglePDFMetadataOption',
                      details: {enabled: !options.isPdfMetadataImportOptionEnabled},
                    })
                  }
                />
              }
              label={<FormattedMessage id="toolbarMenu.pdfMetaData.label" />}
            />
          </MenuItem>
        </List>
      </Collapse>
    </>
  )
}

export default ExperimentalFeaturesMenu
