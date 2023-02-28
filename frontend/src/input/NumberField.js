import React from 'react'

import TextField from '@material-ui/core/TextField'

const NumberField = ({input, meta, ...rest}) => (
  <TextField
    {...input}
    {...rest}
    type="number"
    onChange={event => input.onChange(event.target.value)}
    error={meta.touched && meta.error}
  />
)

export default NumberField
