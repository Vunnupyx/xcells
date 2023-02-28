import React, {forwardRef} from 'react'

import {Link as RouterLink} from 'react-router-dom'
import MuiLink from '@material-ui/core/Link'

const RefLink = ({children, ...props}, ref) => (
  <MuiLink {...props} component={RouterLink} ref={ref}>
    {children}
  </MuiLink>
)

const Link = forwardRef(RefLink)

Link.propTypes = RouterLink.propTypes

export default Link
