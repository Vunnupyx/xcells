import React, {useEffect, useState} from 'react'

import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import makeStyles from '@material-ui/styles/makeStyles'
import Fade from '@material-ui/core/Fade'
import IconButton from '@material-ui/core/IconButton'

import useMapStore from '../../../hooks/useMapStore'

const useStyles = makeStyles(theme => ({
  fail: {
    color: theme.palette.error.light,
    fontSize: 35,
  },
  success: {
    color: theme.palette.success.light,
    fontSize: 35,
  },
  disabled: {
    color: theme.palette.grey[400],
    fontSize: 35,
  },
  button: {
    zIndex: theme.zIndex.appBar,
  },
}))

const timeout = {
  enter: 100,
  exit: 1000,
}

const MapStorePulse = () => {
  const store = useMapStore()
  const [show, setShow] = useState()
  const classes = useStyles()
  const {isWriteable, isConnected, isLoading, gotUpdate, isLastUpdateSuccessful, reconnect} = store

  useEffect(() => {
    setShow(true)
    if (gotUpdate) {
      const ref = setTimeout(() => setShow(false), 300)
      return () => clearTimeout(ref)
    }
    return () => undefined
  }, [store, gotUpdate])

  if (isWriteable === false) {
    return null
  }

  const isNew = !gotUpdate || isLoading
  const isError = (!isNew && !isConnected) || !isLastUpdateSuccessful

  const className = isNew ? classes.disabled : isError ? classes.fail : classes.success

  const button = (
    <IconButton className={classes.button} onClick={reconnect} size="small">
      <CloudUploadIcon className={className} fontSize="inherit" />
    </IconButton>
  )

  if (isNew || isError) return button

  return (
    <Fade key={gotUpdate.timestamp} in={show} exit timeout={timeout}>
      {button}
    </Fade>
  )
}

export default MapStorePulse
