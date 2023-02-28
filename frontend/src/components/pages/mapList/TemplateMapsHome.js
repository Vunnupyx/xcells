import React, {useEffect, useRef, useState} from 'react'

import {useHistory} from 'react-router-dom'
import makeStyles from '@material-ui/styles/makeStyles'
import Typography from '@material-ui/core/Typography'
import CardMedia from '@material-ui/core/CardMedia'
import Card from '@material-ui/core/Card'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import CardContent from '@material-ui/core/CardContent'
import AddIcon from '@material-ui/icons/Add'
import CardActionArea from '@material-ui/core/CardActionArea'
import useFormattedTemplateList from '../../../hooks/useFormattedTemplateList'

const MAX_CARDS = 8
const MIN_CARD_SIZE = 255

const MOBILE_MAXIMUM_WIDTH = 1279
const MOBILE_OFFSET_WIDTH = 170
const DESKTOP_OFFSET_WIDTH = 400

const useTextFieldStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%',
    padding: theme.spacing(2),
  },
  card: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 5,
  },
  image: {
    backgroundColor: theme.palette.background.greyBlueB,
    maxHeight: 150,
    minHeight: 150,
    width: '100%',
    objectFit: 'contain',
  },
  coveredImage: {
    backgroundColor: theme.palette.background.greyBlueB,
    maxHeight: 150,
    minHeight: 150,
    width: '100%',
    objectFit: 'cover',
  },
  add: {
    backgroundColor: theme.palette.background.green,
    color: 'white',
    height: '100%',
    maxHeight: 150,
    width: '100%',
  },
}))

/**
 * By editing this function, you can change the resize behaviour.
 */
const calcCardCounter = width => Math.min(Math.round(width / MIN_CARD_SIZE), MAX_CARDS)

/**
 * Tries to guess the width of the toolbar before first render
 */
const getInitWidth = () => {
  const windowsWidth = window.innerWidth
  return windowsWidth - (windowsWidth <= MOBILE_MAXIMUM_WIDTH ? MOBILE_OFFSET_WIDTH : DESKTOP_OFFSET_WIDTH)
}

const TemplateCard = ({template}) => {
  const {push} = useHistory()
  const classes = useTextFieldStyles()

  return (
    <CardActionArea onClick={() => push(`/maps/new/from/template/${template._id}`)}>
      <Card variant="outlined" className={classes.card}>
        <CardMedia
          className={template.properties?.imageFit === 'cover' ? classes.coveredImage : classes.image}
          component="img"
          src={template.picture}
        />
      </Card>
      <CardContent>
        <Typography align="left" variant="body1">
          {template.properties?.shownName ? template.properties.shownName : template.name || <>&nbsp;</>}
        </Typography>
      </CardContent>
    </CardActionArea>
  )
}

const TemplateMapsHome = () => {
  const ref = useRef({offsetWidth: getInitWidth()})
  const classes = useTextFieldStyles()
  const {push} = useHistory()
  const {data} = useFormattedTemplateList()

  const [, forceRerender] = useState()

  const shownCards = calcCardCounter(ref.current.offsetWidth)

  // Recalculate on window resize
  useEffect(() => {
    const refreshShownCards = () => forceRerender({})
    window.addEventListener('resize', refreshShownCards)
    return () => window.removeEventListener('resize', refreshShownCards)
  }, [forceRerender])

  // Test resizing the windows width when changing the structure here
  return (
    <div ref={ref} className={classes.div}>
      <Typography style={{color: '#2D4357'}} variant="h5" gutterBottom>
        Create a New Map
      </Typography>
      <Paper variant="outlined" className={classes.paper}>
        <Grid container direction="row" spacing={0} wrap="nowrap">
          <CardActionArea onClick={() => push('/maps/new')}>
            <Card variant="elevation" elevation={0} className={classes.card}>
              <AddIcon className={classes.add} />
            </Card>
            <CardContent>
              <Typography align="left" variant="body1">
                Empty Map
              </Typography>
            </CardContent>
          </CardActionArea>
          {data.slice(0, shownCards).map(template => (
            <TemplateCard key={template._id} template={template} />
          ))}
        </Grid>
      </Paper>
    </div>
  )
}

export default TemplateMapsHome
