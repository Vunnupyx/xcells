import React from 'react'
import Typography from '@material-ui/core/Typography'
import useApiQuery from '../hooks/useApiQuery'

const Username = ({userId}) => {
  const {data} = useApiQuery({
    url: `/users/${userId}`,
    cacheTime: Infinity,
    staleTime: Infinity,
  })
  const username = data?.name || <em>anonymous</em>

  return <Typography variant="body2">@{username}</Typography>
}

export default Username
