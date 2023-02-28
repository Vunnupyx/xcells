import React from 'react'

import Typography from '@material-ui/core/Typography'
import CardContent from '@material-ui/core/CardContent'
import Box from '@material-ui/core/Box'
import makeStyles from '@material-ui/styles/makeStyles'

import SharedWithAvatars from './SharedWithAvatars'

const useStyles = makeStyles(() => ({
  cardContent: {
    lineHeight: '1.5em',
    height: '4.5em',
    overflow: 'hidden',
  },
}))

const MapCardTitle = ({item, isPublic}) => {
  const classes = useStyles()

  return (
    <CardContent style={{padding: 10}}>
      <Box height={85}>
        <Typography className={classes.cardContent} variant="h5" component="p" align="left">
          {item.title ? item.title : item.name}
        </Typography>
      </Box>
      <Box height={20} flexDirection="row-reverse" display="flex">
        {!isPublic ? <SharedWithAvatars share={item.share} /> : null}
      </Box>
      <Box height={5} />
    </CardContent>
  )
}

export default MapCardTitle
