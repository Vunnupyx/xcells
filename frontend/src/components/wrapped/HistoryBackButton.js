import React from 'react'
import {FormattedMessage} from 'react-intl'
import {useHistory} from 'react-router-dom'

import Button from '@material-ui/core/Button'

const HistoryBackButton = () => (
  <Button onClick={useHistory().goBack}>
    <FormattedMessage id="buttonBackInHistory" />
  </Button>
)

export default HistoryBackButton
