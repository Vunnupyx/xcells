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

  return (
    <Card className={classes.root}>
      <CardActionArea onClick={() => openDialog(OpenaiDialog)}>
        <CardMedia className={classes.media} image={openaiIcon} />
        <CardContent>
          <Typography variant="subtitle1">
            <FormattedMessage id="integration.openai.title" />
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default IntegrationCategory
