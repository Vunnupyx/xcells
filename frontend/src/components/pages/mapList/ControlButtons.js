import React from 'react'
import {FormattedMessage} from 'react-intl'

import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ViewModuleIcon from '@material-ui/icons/ViewModule'
import ViewListIcon from '@material-ui/icons/ViewList'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'

import FilteringTags from './FilteringTags'

const ControlButtons = ({view, setView, shareFilter, setShareFilter, isPublic}) => (
  <Grid container component={Box} flexWrap="nowrap">
    <Grid item component={Box} flexGrow={1}>
      {isPublic ? (
        <Typography style={{color: '#2D4357'}} variant="h5" noWrap>
          <FormattedMessage id="homePublicText" />
        </Typography>
      ) : (
        <Typography style={{color: '#2D4357'}} variant="h5" noWrap>
          <FormattedMessage id="homePrivateText" />
        </Typography>
      )}
    </Grid>
    <Grid item container component={Box} flexShrink={1} justifyContent="center">
      {isPublic ? null : <FilteringTags shareFilter={shareFilter} setShareFilter={setShareFilter} />}
    </Grid>
    <Grid item component={Box} flexGrow={1}>
      <ToggleButtonGroup
        orientation="horizontal"
        value={view}
        exclusive
        onChange={(event, nextView) => setView(nextView)}
      >
        <ToggleButton value="module" aria-label="module">
          <ViewModuleIcon />
        </ToggleButton>
        <ToggleButton value="list" aria-label="list">
          <ViewListIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Grid>
  </Grid>
)

export default ControlButtons
