import React from 'react'
import {useIntl} from 'react-intl'
import PublicIcon from '@material-ui/icons/PublicOutlined'

import IconButton from '@material-ui/core/IconButton'
import PeopleOutlineIcon from '@material-ui/icons/PeopleOutline'
import HomeRoundedIcon from '@material-ui/icons/HomeRounded'
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined'
import MapVisibilityDialog from '../../../dialogs/MapVisibilityDialog'
import useDialog from '../../../../hooks/useDialog'

const VisibilityIcon = ({enabled, hidden, writeable, ...props}) => {
  let Icon
  if (!enabled) Icon = HomeRoundedIcon
  else if (writeable) Icon = CreateOutlinedIcon
  else if (hidden) Icon = PeopleOutlineIcon
  else Icon = PublicIcon

  return <Icon {...props} />
}

const Visibility = ({item, isPublic}) => {
  const openDialog = useDialog()
  const {formatMessage} = useIntl()

  if (isPublic) {
    return <PublicIcon />
  }

  return (
    <IconButton
      size="small"
      onClick={() => openDialog(MapVisibilityDialog, {mapId: item.mapId})}
      title={formatMessage({id: 'dialogMapPrivacyOpenerTitle'})}
    >
      <VisibilityIcon {...item.share?.public} fontSize="small" />
    </IconButton>
  )
}

export default Visibility
