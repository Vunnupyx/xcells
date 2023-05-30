import React from 'react'
import {FormattedMessage} from 'react-intl'

import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/styles/makeStyles'
import Link from '@material-ui/core/Link'
import useDialog from '../../../../hooks/useDialog'
import IntegrationDialog from '../../../dialogs/IntegrationDialog'
import IntegrationCategory from './IntegrationCategory'

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: '#fff',
    borderRadius: theme.shape.borderRadius,
  },
  link: {
    cursor: 'pointer',
    color: '#000ccc',
  },
}))

const IntegrationPage = () => {
  const classes = useStyles()
  const openDialog = useDialog()

  return (
    <Box py={4} px={4} className={classes.root}>
      <Typography variant="h5" component="h2">
        <FormattedMessage id="integrationSettings.appsIntegrations" />
      </Typography>
      <Box mt={3}>
        <Typography variant="body1">
          <Link
            color="inherit"
            className={classes.link}
            onClick={() => openDialog(IntegrationDialog, {children: <IntegrationCategory openDialog={openDialog} />})}
          >
            <FormattedMessage id="integrationSettings.addApps" />
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}

export default IntegrationPage
