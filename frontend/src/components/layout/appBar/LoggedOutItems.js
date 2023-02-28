import React from 'react'

import Button from '@material-ui/core/Button'
import AccountBoxIcon from '@material-ui/icons/AccountBox'
import {FormattedMessage} from 'react-intl'
import useAuth from '../../../hooks/useAuth'

const LoggedOutItems = () => {
  const {login} = useAuth()
  return (
    <Button size="small" startIcon={<AccountBoxIcon />} variant="contained" color="primary" onClick={login}>
      <FormattedMessage id="button.login" />
    </Button>
  )
}

export default LoggedOutItems
