import React from 'react'

import MUTextField from '@material-ui/core/TextField'

const TextField = ({input, meta, ...rest}) => (
  <MUTextField
    {...input}
    {...rest}
    onChange={event => input.onChange(event.target.value)}
    error={meta.touched && meta.error}
  />
)

export default TextField
