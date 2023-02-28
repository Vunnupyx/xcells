import Link from '@material-ui/core/Link'
import React from 'react'

const Copyright = () => (
  <>
    {'Copyright © '}
    <Link color="inherit" href="https://infinitymaps.io/">
      Infinity Maps
    </Link>{' '}
    {new Date().getFullYear()}.
  </>
)

export default Copyright
