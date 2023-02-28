import React from 'react'
import Avatar from '@material-ui/core/Avatar'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import makeStyles from '@material-ui/styles/makeStyles'

import useApiQuery from '../hooks/useApiQuery'

const useStyles = makeStyles(theme => ({
  large: {
    width: theme.spacing(5),
    height: theme.spacing(5),
  },
}))

const UserAvatar = ({userId}) => {
  const classes = useStyles()

  const {data} = useApiQuery({
    url: `/users/${userId}`,
    enabled: userId,
    cacheTime: Infinity,
    staleTime: Infinity,
  })

  return (
    <Avatar className={classes.large} aria-label="recipe">
      {data?.name ? data.name.charAt(0).toUpperCase() : <AccountCircleIcon />}
    </Avatar>
  )
}

export default UserAvatar
