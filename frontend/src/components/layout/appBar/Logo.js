import React from 'react'
import makeStyles from '@material-ui/styles/makeStyles'
import {Link} from 'react-router-dom'
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
    <Link to="/maps">
      <img alt="xCELLS Logo" className={classes.logoInfinity} src={logo} />
    </Link>
  )
}

export default Logo
