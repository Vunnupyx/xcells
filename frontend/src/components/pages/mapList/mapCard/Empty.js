import React from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import {FormattedMessage} from 'react-intl'
import Box from '@material-ui/core/Box'
import infinityContent from '../../../../assets/infinitymaps-app-content-home.svg'
import Link from '../../../wrapped/Link'
import NewMapDialog from '../../../layout/NewMapDialog'

const imageStyle = {
  width: '100%',
}

const Empty = ({open, setOpen}) => (
  <Box marginTop={4}>
    <Grid container justifyContent="center">
      <Grid item container spacing={1} direction="column" alignItems="center" component={Box} maxWidth={300}>
        <Grid item>
          <img alt="Infinity Maps content" style={imageStyle} src={infinityContent} />
        </Grid>
        <Grid item>
          <Typography color="textPrimary" align="center" variant="h4">
            <FormattedMessage id="emptyMapsHeader" />
          </Typography>
        </Grid>
        <Grid item>
          <Typography color="textSecondary" align="center" variant="body1">
            <FormattedMessage id="emptyMapsMessages" />
          </Typography>
        </Grid>
        <Grid item container spacing={1} justifyContent="center">
          <Grid item>
            <Button onClick={() => setOpen(!open)} variant="contained" color="primary">
              <FormattedMessage id="buttonCreateMap" />
            </Button>
            <NewMapDialog open={open} setOpen={setOpen} />
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

export default Empty
