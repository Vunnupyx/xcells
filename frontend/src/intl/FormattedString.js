import React from 'react'
import {FormattedMessage} from 'react-intl'

const FormattedString = props => <FormattedMessage {...props}>{s => s}</FormattedMessage>

export default FormattedString
