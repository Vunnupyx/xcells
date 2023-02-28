import React, {useCallback, useEffect} from 'react'
import {FormattedMessage, useIntl} from 'react-intl'
import {useLocalStorage} from 'react-use'

import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import DevModeSubmenu from '../devMode/DevModeSubmenu'
import {track} from '../../../contexts/tracking'
import ExperimentalFeaturesMenu from '../experimentalFeatures/ExperimentalFeaturesSubmenu'
import useInteractionManager from '../../engine/useInteractionManager'

const SettingsMenu = ({mapId, ...props}) => {
  const [showGhosts, setShowGhosts] = useLocalStorage('engine.showGhosts', true)
  const {
    setState,
    state: {isShowAllEdges},
  } = useInteractionManager()
  const {formatMessage} = useIntl()

  useEffect(() => {
    if (showGhosts !== undefined) {
      setState({showGhosts})
    }
  }, [setState, showGhosts])

  const toggleShowAllEdges = useCallback(() => {
    setState(({isShowAllEdges: show}) => ({isShowAllEdges: !show}))
  }, [setState])

  return (
    <Menu {...props}>
      <MenuItem>
        <FormControlLabel
          labelPlacement="end"
          title={formatMessage({id: 'toolbarMenu.showAllEdges.tooltip'})}
          control={
            <Switch
              value="unnecessary"
              color="primary"
              checked={isShowAllEdges}
              onChange={toggleShowAllEdges}
              onClick={() => track({action: 'toggleConnections', details: {showEdges: !isShowAllEdges}})}
            />
          }
          label={<FormattedMessage id="toolbarMenu.showAllEdges.label" />}
        />
      </MenuItem>
      <MenuItem>
        <FormControlLabel
          labelPlacement="end"
          title={formatMessage({id: 'toolbarMenu.showGhosts.tooltip'})}
          control={
            <Switch
              value="unnecessary"
              color="primary"
              checked={showGhosts}
              // TODO: replace this with function based approach when useLocalStorage is fixed
              onChange={() => setShowGhosts(!showGhosts)}
              title={formatMessage({id: 'toolbarMenu.showGhosts.tooltip'})}
              onClick={() => track({action: 'toggleCardButtons', details: {showGhosts: !showGhosts}})}
            />
          }
          label={<FormattedMessage id="toolbarMenu.showGhosts.label" />}
        />
      </MenuItem>
      <ExperimentalFeaturesMenu />
      <DevModeSubmenu />
    </Menu>
  )
}

SettingsMenu.propTypes = Menu.propTypes

export default SettingsMenu
