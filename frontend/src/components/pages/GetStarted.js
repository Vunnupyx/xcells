import React, {useState} from 'react'
import ReactPlayer from 'react-player'
import {FormattedMessage, useIntl} from 'react-intl'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Hidden from '@material-ui/core/Hidden'
import Link from '../wrapped/Link'
import NewMapDialog from '../layout/NewMapDialog'
import useAuth from '../../hooks/useAuth'
import {RegisterButton} from './CallToRegister'

const GET_STARTED_URLS = {
  // TODO: add the german url if available
  // de: "",
  en: 'https://youtu.be/LJOzp6NCeoU',
}

const GetStarted = () => {
  const {locale} = useIntl()
  const [open, setOpen] = useState(false)
  const {isLoggedIn} = useAuth()

  const url = locale in GET_STARTED_URLS ? GET_STARTED_URLS[locale] : GET_STARTED_URLS.en

  return (
    <Grid container direction="column" alignItems="center">
      <Grid container component={Box} maxWidth={640} spacing={1}>
        <Grid item>
          <Typography variant="h3">
            <FormattedMessage id="homeGetStartedTitle" />
          </Typography>
          <Typography variant="h5" gutterBottom color="textSecondary">
            <FormattedMessage id="homeGetStartedSubtitle" />
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="body1" paragraph>
            <FormattedMessage id="homeGetStartedSummary" />
          </Typography>
        </Grid>
        <Grid item>
          <Hidden smDown>
            <ReactPlayer url={url} width={640} height={360} />
          </Hidden>
          <Hidden mdUp>
            <Grid container direction="column" alignItems="center">
              <Grid item>
                <ReactPlayer url={url} width={320} height={180} />
              </Grid>
            </Grid>
          </Hidden>
        </Grid>
        <Grid item container spacing={1} justifyContent="center">
          {isLoggedIn ? (
            <Grid item>
              <Button onClick={() => setOpen(!open)} variant="contained" color="primary">
                <FormattedMessage id="homeGetStartedCreateMapButton" />
              </Button>
              <NewMapDialog open={open} setOpen={setOpen} />
            </Grid>
          ) : (
            <Grid item>
              <RegisterButton />
            </Grid>
          )}
          <Grid item>
            <Button component={Link} to="/maps/tutorials" variant="contained">
              <FormattedMessage id="homeGetStartedMoreTutorialsButton" />
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default GetStarted
