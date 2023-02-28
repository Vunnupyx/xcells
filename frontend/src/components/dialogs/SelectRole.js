import React from 'react'
import {FormattedMessage} from 'react-intl'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import {ACCESS_ROLES} from '../../shared/config/constants'

const SelectRole = ({role, onRoleChange}) => (
  <Select
    value={role}
    onChange={event => {
      onRoleChange(event.target.value)
    }}
  >
    {Object.values(ACCESS_ROLES).map(role_ => (
      <MenuItem key={role_} value={role_}>
        <FormattedMessage id={`mapShare.accessRoles.${role_}`} />
      </MenuItem>
    ))}
  </Select>
)

export default SelectRole
