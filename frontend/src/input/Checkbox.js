import React from 'react'

import MUCheckbox from '@material-ui/core/Checkbox'

const Checkbox = ({input, meta, ...rest}) => (
  <MUCheckbox
    {...input}
    {...rest}
    onChange={event => input.onChange(event.target.checked)}
    error={meta.touched && meta.error}
  />
)

export default Checkbox
