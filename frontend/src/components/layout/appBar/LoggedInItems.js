import React, {useState} from 'react'
import makeStyles from '@material-ui/styles/makeStyles'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'

import {FormattedMessage} from 'react-intl'
import NewMapDialog from '../NewMapDialog'

const useStyles = makeStyles(theme => ({
  loginButton: {
    color: 'white',
    backgroundColor: theme.palette.background.green100,
    borderRadius: 18,
    marginRight: theme.spacing(3),
    '&:hover': {
      backgroundColor: theme.palette.background.lachs100,
      color: 'white',
    },
  },
}))

const LoggedInItems = () => {
  const classes = useStyles()
  const [open, setOpen] = useState(false)

  const handleCLick = () => {
    setOpen(i => !i)
  }

  return (
    <>
      <Button
        startIcon={<AddIcon />}
        className={classes.loginButton}
        variant="contained"
        onClick={() => {
          handleCLick()
        }}
      >
        <FormattedMessage id="buttonCreateMap" />
      </Button>
      <NewMapDialog open={open} setOpen={setOpen} />
    </>
  )
}

export default LoggedInItems
