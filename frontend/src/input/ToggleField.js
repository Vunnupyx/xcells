import React from 'react'

import ToggleButton from '@material-ui/lab/ToggleButton'

const ToggleField = ({input: {onChange, value}, label, ...rest}) => (
  <ToggleButton
    label={label}
    toggled={!!value}
    onToggle={(event, isInputChecked) => onChange(isInputChecked)}
    {...rest}
  />
)

export default ToggleField
