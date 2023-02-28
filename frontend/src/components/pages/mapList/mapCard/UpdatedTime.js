import React from 'react'
import {FormattedMessage} from 'react-intl'

import Typography from '@material-ui/core/Typography'
import UpdateIcon from '@material-ui/icons/Update'
import CardAgoMoment from '../../../wrapped/CardAgoMoment'

const UpdatedTime = ({item}) => {
  const overflowText = {
    overflow: 'hidden',
    minWidth: 0,
    maxWidth: '40vw', // For mobile view with large card paddings (was unable to fix with @media on global styles)
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  }

  return (
    <Typography component="div" style={{...overflowText}}>
      <UpdateIcon fontSize="small" />
      <CardAgoMoment value={item.updatedAt} /> <FormattedMessage id="mapCardTimeAgo" />
    </Typography>
  )
}

export default UpdatedTime
