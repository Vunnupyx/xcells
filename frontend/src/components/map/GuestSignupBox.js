import React, {useEffect} from 'react'

import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import makeStyles from '@material-ui/styles/makeStyles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import {FormattedMessage} from 'react-intl'
import CancelIcon from '@material-ui/icons/Cancel'

import {useConfig} from '../../styles/config'
import useAuth from '../../hooks/useAuth'

const useStyles = makeStyles({
  paper: {
    borderRadius: 10,
    position: 'absolute',
    width: 256,
    right: 20,
    top: 80,
  },
  signup: {
    marginBottom: 0,
    borderRadius: 10,
    color: 'white',
    '&:hover': {},
  },
  icon: {
    float: 'right',
  },
})

const GuestSignupBox = () => {
  const classes = useStyles()
  const {signup} = useAuth()
  const config = useConfig()
  const [hidePaper, setHidePaper] = React.useState(true)

  const timeout = config.delay.signupBox

  useEffect(() => {
    const ref = setTimeout(() => setHidePaper(false), timeout)
    return () => clearTimeout(ref)
  }, [timeout])

  const handleDelete = () => {
    setHidePaper(!hidePaper)
  }

  return (
    <Paper hidden={hidePaper} className={classes.paper} elevation={20}>
      <IconButton className={classes.icon} onClick={handleDelete} aria-label="delete">
        <CancelIcon />
      </IconButton>
      <Box p={4} textAlign="center">
        <Typography gutterBottom variant="h5">
          <FormattedMessage id="signupMessageForGuests" />
        </Typography>
        <Button fullWidth color="primary" autoFocus variant="contained" className={classes.signup} onClick={signup}>
          <FormattedMessage id="buttonSignUp" />
        </Button>
      </Box>
    </Paper>
  )
}
export default GuestSignupBox
