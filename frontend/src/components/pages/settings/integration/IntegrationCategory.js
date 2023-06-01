import React from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import {FormattedMessage} from 'react-intl'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/styles/makeStyles'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardMedia from '@material-ui/core/CardMedia'
import openaiIcon from '../../../../assets/openai.jpg'
import OpenaiDialog from '../../../dialogs/OpenaiDialog'
import useApiQuery from '../../../../hooks/useApiQuery'

const useStyles = makeStyles({
  root: {
    width: 240,
  },
  media: {
    minHeight: 150,
  },
})

const IntegrationCategory = ({openDialog}) => {
  const classes = useStyles()
  const {data} = useApiQuery({
    url: '/integration/openai',
    cacheTime: 0,
    staleTime: 0,
  })

  return (
    <Card className={classes.root}>
      <CardActionArea onClick={() => openDialog(OpenaiDialog, {initialOpenai: data?.openai})}>
        <CardMedia className={classes.media} image={openaiIcon} />
        <CardContent>
          <Typography variant="subtitle1" align="center">
            <FormattedMessage id="integration.openai.title" />
          </Typography>
          {data && (
            <Typography variant="subtitle2" color="primary" align="center">
              <FormattedMessage id="integration.openai.installed" />
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default IntegrationCategory
