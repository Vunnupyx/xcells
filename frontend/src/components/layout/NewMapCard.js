import React from 'react'
import makeStyles from '@material-ui/styles/makeStyles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'

const useStyles = makeStyles({
  root: {
    width: 260,
  },
  media: {
    minHeight: 150,
  },
})

const NewMapCard = ({image, title, onClick}) => {
  const classes = useStyles()

  return (
    <Card elevation={5} className={classes.root}>
      <CardActionArea onClick={() => onClick()}>
        {image ? <CardMedia className={classes.media} image={image} /> : <div className={classes.media} />}
        <Divider />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {title}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
export default NewMapCard
