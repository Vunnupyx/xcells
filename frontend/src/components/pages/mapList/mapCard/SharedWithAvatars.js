import React from 'react'
import Avatar from '@material-ui/core/Avatar'
import AvatarGroup from '@material-ui/lab/AvatarGroup'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'

import useApiQuery from '../../../../hooks/useApiQuery'

const SmallUserAccount = ({coll}) => {
  let name
  const isUser = coll.subjectId && coll.subjectType === 'user'

  const {data: userData} = useApiQuery({
    url: `/users/${coll.subjectId}`,
    enabled: isUser,
    cacheTime: Infinity,
    staleTime: Infinity,
  })

  if (isUser && userData?.name) {
    name = userData.name
  }

  return (
    <Tooltip title={name || <em>anonymous</em>} key={name}>
      <Avatar
        style={{
          padding: 0,
          width: 30,
          height: 30,
        }}
        className="MuiAvatarGroup-avatar"
        alt={name}
      >
        {name ? name.toUpperCase().charAt(0) : <AccountCircleIcon />}
      </Avatar>
    </Tooltip>
  )
}

const SharedWithAvatars = ({mapId = undefined, share = undefined}) => {
  const {data: shareData} = useApiQuery({
    url: `/maps/${mapId}/share`,
    enabled: mapId && !share,
    cacheTime: 10000,
    staleTime: 10000,
  })

  const access = share?.access ? share.access : shareData?.access ? shareData.access : []

  return (
    <Typography component="div" align="left">
      <AvatarGroup max={10} style={{marginLeft: 0, padding: 0}}>
        {access.map(coll => (
          <SmallUserAccount coll={coll} key={coll.subjectId} />
        ))}
      </AvatarGroup>
    </Typography>
  )
}
export default SharedWithAvatars
