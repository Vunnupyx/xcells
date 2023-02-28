import React from 'react'
import {useHistory} from 'react-router-dom'

import Card from '@material-ui/core/Card'
import Grid from '@material-ui/core/Grid'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import Chip from '@material-ui/core/Chip'
import Divider from '@material-ui/core/Divider'
import MorePopover from './MorePopover'

import CardHeader from './CardHeader'
import UserAvatar from '../../../UserAvatar'
import MapCategory from './MapCategory'
import concatPathAnchor from '../../../../utils/concatPathAnchor'
import UpdatedTime from './UpdatedTime'
import Username from '../../../Username'
import MapCardTitle from './MapCardTitle'
import Visibility from './Visibility'

const MapCard = ({data, isPublic}) => {
  const {push} = useHistory()

  const openNewTab = item => {
    window.open(concatPathAnchor(`/maps/${item.mapId}`, item.title))
  }

  const openSameTab = item => {
    push(concatPathAnchor(`/maps/${item.mapId}`, item.title))
  }

  return (
    <Grid container spacing={2}>
      {data.map(item => (
        <Grid key={item.mapId} item xs={12} sm={6} md={4} lg={3} xl={2}>
          <Card variant="elevation" elevation={2} style={{height: '100%', maxHeight: 270}}>
            <CardHeader
              avatar={<UserAvatar userId={item.userId} />}
              action={isPublic ? null : <MorePopover mapId={item.mapId} />}
              subaction={<Visibility isPublic={isPublic} item={item} />}
              title={<Username userId={item.userId} />}
              subheader={<UpdatedTime isPublic={isPublic} item={item} />}
            />
            <Divider variant="fullWidth" />
            <CardActionArea onAuxClick={() => openNewTab(item)} title={item.name} onClick={() => openSameTab(item)}>
              <MapCardTitle item={item} isPublic={isPublic} />
            </CardActionArea>
            {/* <GroupAvatars map={item} mapId={item.mapId} /> */}

            <CardActions disableSpacing>
              {isPublic ? (
                item.category ? (
                  <Chip color="primary" size="small" label={item.category} />
                ) : null
              ) : (
                <MapCategory mapId={item.mapId} map={item} />
              )}
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default MapCard
