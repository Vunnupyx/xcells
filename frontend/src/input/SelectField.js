import React from 'react'

import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

const SelectField = ({input, options, ...rest}) => (
  <Select {...input} {...rest}>
    {options.map(({label, value}) => (
      <MenuItem key={value} value={value}>
        {label}
      </MenuItem>
    ))}
  </Select>
)

export default SelectField
