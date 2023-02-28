import Button from '@material-ui/core/Button'
import React from 'react'
import makeStyles from '@material-ui/styles/makeStyles'
import Link from './wrapped/Link'

const useStyles = makeStyles(theme => ({
  feedback: {
    position: 'fixed',
    top: '50%',
    zIndex: theme.zIndex.tooltip + 1,
    right: 0,
    transformOrigin: '100% 100%',
    borderRadius: 1,
    transform: 'rotate(-90deg) translate(100%, 0)',
    textTransform: 'none',
  },
}))

const FeedbackButton = () => {
  const classes = useStyles()

  return (
    <Button component={Link} to="/maps/feedback" className={classes.feedback} variant="contained" color="primary">
      Feedback
    </Button>
  )
}

export default FeedbackButton
