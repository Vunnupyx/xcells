import React from 'react'
import makeStyles from '@material-ui/styles/makeStyles'
import MuiLink from '@material-ui/core/Link'
import logo from '../../../assets/xcells_logo.png'

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
      <img alt="xCELLS Logo" className={classes.logoInfinity} src={logo} />
    </MuiLink>
  )
}

export default Logo
