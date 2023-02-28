import MuiIconButton from '@material-ui/core/IconButton'
import React from 'react'
import makeStyles from '@material-ui/styles/makeStyles'

const useStyles = makeStyles(() => ({
  root: {
    padding: 5,
  },
}))

const IconButton = ({children, ...props}) => {
  const classes = useStyles()
  return (
    <MuiIconButton classes={classes} {...props}>
      {children}
    </MuiIconButton>
  )
}

export default IconButton
