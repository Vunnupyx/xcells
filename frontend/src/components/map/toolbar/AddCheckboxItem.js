import React, {useCallback} from 'react'
import {FormattedMessage} from 'react-intl'

import ListItemIcon from '@material-ui/core/ListItemIcon'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import MenuItem from '@material-ui/core/MenuItem'

import {trackAction} from '../../../contexts/tracking'
import useEngineControl from '../../engine/useEngineControl'
import useInteractionManager from '../../engine/useInteractionManager'

const AddCheckboxItem = () => {
  const {lastSelectedNode} = useInteractionManager()
  const {removeCheckBox, setCheckBox} = useEngineControl()

  const isDisabled = !lastSelectedNode || lastSelectedNode.isRoot

  const hasCheckBox = lastSelectedNode?.hasCheckBox()

  const toggleCheckBox = useCallback(() => {
    if (lastSelectedNode?.hasCheckBox()) {
      removeCheckBox()
      trackAction('removeCheckBox')
    } else {
      setCheckBox(false)
      trackAction('addCheckBox')
    }
  }, [removeCheckBox, setCheckBox, lastSelectedNode])

  return (
    <MenuItem button disabled={isDisabled} onClick={toggleCheckBox}>
      <ListItemIcon>
        <CheckBoxIcon />
      </ListItemIcon>
      {hasCheckBox ? (
        <FormattedMessage id="toolbarMenu.checkBox.remove" />
      ) : (
        <FormattedMessage id="toolbarMenu.checkBox.add" />
      )}
    </MenuItem>
  )
}

export default AddCheckboxItem
