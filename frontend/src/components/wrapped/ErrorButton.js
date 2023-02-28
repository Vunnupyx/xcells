import React from 'react'

import makeStyles from '@material-ui/styles/makeStyles'
import Button from '@material-ui/core/Button'
import clsx from 'clsx'

const useStyles = makeStyles(theme => ({
  error: {
    color: theme.palette.getContrastText(theme.palette.error.main),
    backgroundColor: theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.light,
    },
  },
}))

const ErrorButton = ({children, className, ...props}) => {
  const classes = useStyles()

  return (
    <Button className={clsx(classes.error, className)} {...props}>
      {children}
    </Button>
  )
}

export default ErrorButton
