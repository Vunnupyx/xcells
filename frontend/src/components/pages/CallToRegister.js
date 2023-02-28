import React from 'react'
import {FormattedMessage} from 'react-intl'

import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import MuiLink from '@material-ui/core/Link'

import Link from '../wrapped/Link'
import infinityContent from '../../assets/infinitymaps-app-content-home.svg'

const imageStyle = {
  width: '100%',
}

export const RegisterButton = () => (
  <Button component={MuiLink} href="https://infinitymaps.io/en/signup/" variant="contained" color="primary">
    <FormattedMessage id="buttonRegister" />
  </Button>
)

const CallToRegister = () => (
  <Box marginTop={4}>
    <Grid container justifyContent="center">
      <Grid item container spacing={1} direction="column" component={Box} maxWidth={400}>
        <Grid item>
          <img alt="Infinity Maps content" style={imageStyle} src={infinityContent} />
        </Grid>
        <Grid item>
          <Typography color="textPrimary" align="center" variant="h4">
            <FormattedMessage id="callToRegisterTitle" />
          </Typography>
        </Grid>
        <Grid item>
          <Typography color="textSecondary" align="center" variant="body1" gutterBottom>
            <FormattedMessage id="callToRegisterMessages" />
          </Typography>
        </Grid>
        <Grid item container spacing={1} justifyContent="center">
          <Grid item>
            <RegisterButton />
          </Grid>
          <Grid item>
            <Button component={Link} to="/maps/get-started" variant="contained" color="secondary">
              <FormattedMessage id="buttonGetStarted" />
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </Box>
)

export default CallToRegister
