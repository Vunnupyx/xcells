import React, {useState} from 'react'
import {FormattedMessage} from 'react-intl'

import makeStyles from '@material-ui/styles/makeStyles'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Hidden from '@material-ui/core/Hidden'
import TextField from '@material-ui/core/TextField'

import MapList from './mapList/MapList'
import ControlButtons from './mapList/ControlButtons'
import MAP_SHARE_FILTERS from './mapList/MAP_SHARE_FILTERS'
import HomePageLayout from '../layout/HomePageLayout'
import TemplateMapsHome from './mapList/TemplateMapsHome'
import HiddenForGuest from '../hide/HiddenForGuest'

const useTextFieldStyles = makeStyles(theme => ({
  root: {
    backgroundColor: '#fff',
    borderRadius: theme.shape.borderRadius,
    width: 500,
    maxWidth: '45%',
  },
}))

const MapOverview = ({isPublic = false}) => {
  const classes = useTextFieldStyles()
  const [view, setView] = React.useState('module')
  const [shareFilter, setShareFilter] = React.useState(MAP_SHARE_FILTERS.all)
  const [searchText, setSearchText] = useState('')

  const textField = (
    <TextField
      classes={classes}
      margin="dense"
      size="small"
      label={<FormattedMessage id="searchForMap" />}
      variant="outlined"
      onChange={event => setSearchText(event.target.value)}
    />
  )

  const list = <MapList isPublic={isPublic} shareFilter={shareFilter} searchText={searchText} view={view} />

  return (
    <HomePageLayout toolbar={textField}>
      <Hidden smDown>
        <Grid container direction="column" component={Box} spacing={2}>
          <HiddenForGuest>
            <Grid item>
              <TemplateMapsHome />
            </Grid>
          </HiddenForGuest>
          <Grid item>
            <ControlButtons
              isPublic={isPublic}
              view={view}
              setView={setView}
              shareFilter={shareFilter}
              setShareFilter={setShareFilter}
            />
          </Grid>
          <Grid item>{list}</Grid>
        </Grid>
      </Hidden>

      <Hidden mdUp>{list}</Hidden>
    </HomePageLayout>
  )
}

export default MapOverview
