import React from 'react'
import makeStyles from '@material-ui/styles/makeStyles'
import MuiLink from '@material-ui/core/Link'
import infinity from '../../../assets/210218_infinitymaps-logo_final-charcoal.png'

const useStyles = makeStyles(() => ({
  logoInfinity: {
    height: 30,
    verticalAlign: 'bottom',
  },
}))

const Logo = () => {
  const classes = useStyles()

  return (
    <MuiLink href="https://infinitymaps.io" target="_top">
      <img alt="Infinity Logo" className={classes.logoInfinity} src={infinity} />
    </MuiLink>
  )
}

export default Logo
