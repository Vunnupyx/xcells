import React, {useEffect, useRef, useState} from 'react'
import {Link, useHistory} from 'react-router-dom'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import {makeStyles, useTheme} from '@material-ui/core/styles'
import DialogContent from '@material-ui/core/DialogContent'
import AddIcon from '@material-ui/icons/Add'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import {track} from '../contexts/tracking'
import howToGetStartedPng from '../assets/HowToGetStarted.png'
import yourOwnMapPng from '../assets/YourOwnMap.png'
import yourOwnMapJson from '../assets/YourOwnMap.json'
import howToGetStartedJson from '../assets/HowToGetStarted.json'
import useFormattedTemplateList from '../hooks/useFormattedTemplateList'
import useApi from '../hooks/useApi'

const MOBILE_MAXIMUM_WIDTH = 1279
const MOBILE_OFFSET_WIDTH = 170
const DESKTOP_OFFSET_WIDTH = 400

/**
 * Tries to guess the width of the toolbar before first render
 */
const getInitWidth = () => {
  const windowsWidth = window.innerWidth
  return windowsWidth - (windowsWidth <= MOBILE_MAXIMUM_WIDTH ? MOBILE_OFFSET_WIDTH : DESKTOP_OFFSET_WIDTH)
}

const useTextFieldStyles = makeStyles(theme => ({
  root: {zIndex: '1501 !important'},
  cardTitle: {
    margin: '-5px !important',
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
    borderRadius: 5,
    maxHeight: 150,
    height: '100%',
    minHeight: 150,
    width: '100%',
  },
  '@media (max-width:500px)': {
    add: {
      maxHeight: 50,
      minHeight: 50,
    },
    coveredImage: {
      maxHeight: 50,
      minHeight: 50,
    },
    image: {
      maxHeight: 50,
      minHeight: 50,
    },
  },

  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
}))

const TemplateCard = ({template, classes}) => {
  const {push} = useHistory()

  return (
    <Grid item xs={3}>
      <CardActionArea
        onClick={() => {
          track({action: 'mapCreate', details: {method: 'startDialog', interaction: template.name}})
          return template.handleClick ? template.handleClick() : push(`/maps/new/from/template/${template._id}`)
        }}
      >
        <Card variant="outlined" className={classes.card}>
          <CardMedia
            className={template.properties?.imageFit === 'cover' ? classes.coveredImage : classes.image}
            component="img"
            src={template.picture}
          />
        </Card>
        <CardContent>
          <Typography className={classes.cardTitle} align="center" variant="body2">
            {template.properties?.shownName ? template.properties.shownName : template.name || <>&nbsp;</>}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Grid>
  )
}

const TemplateMaps = ({data, classes}) => {
  const {push} = useHistory()

  return (
    <div>
      <Grid container spacing={1} direction="row" justify="center">
        <Grid item xs={3}>
          <CardActionArea onClick={() => push('/maps/new')}>
            <Card variant="elevation" elevation={0} className={classes.card}>
              <AddIcon className={classes.add} />
            </Card>
            <CardContent>
              <Typography className={classes.cardTitle} align="center" variant="body2">
                Empty Map
              </Typography>
            </CardContent>
          </CardActionArea>
        </Grid>
        {data.map(template => (
          <TemplateCard key={template?._id} template={template} classes={classes} />
        ))}
      </Grid>
    </div>
  )
}

const FirstLoginDialog = () => {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [open, setOpen] = React.useState(true)
  const classes = useTextFieldStyles()
  const {push} = useHistory()
  const {data, isFetching} = useFormattedTemplateList()
  const api = useApi()
  const ref = useRef({offsetWidth: getInitWidth()})

  const [, forceRerender] = useState()

  // Recalculate on window resize
  useEffect(() => {
    const refreshShownCards = () => forceRerender({})
    window.addEventListener('resize', refreshShownCards)
    return () => window.removeEventListener('resize', refreshShownCards)
  }, [forceRerender])
  // Test resizing the windows width when changing the structure here

  const handleClose = () => {
    setOpen(false)
    push('/maps')
  }

  const handleHowToGetStartedClick = async () => {
    const url = '/maps/import'
    const {mapId} = await api.post(url, {body: howToGetStartedJson, params: {filename: 'HowToGetStarted'}})
    push(`/maps/${mapId}`)
    // track({action: 'mapCreate', details: {interaction: 'howToGetStarted'}})
  }

  const handleCreateYourOwnMapClick = async () => {
    const url = '/maps/import'
    const {mapId} = await api.post(url, {body: yourOwnMapJson, params: {filename: 'CreateYourOwnMap'}})
    push(`/maps/${mapId}`)
    // track({action: 'mapCreate', details: {interaction: 'yourOwnMap'}})
  }

  const dataAlternative = [
    {
      picture: howToGetStartedPng,
      name: 'How to start',
      handleClick: handleHowToGetStartedClick,
    },
    {
      picture: yourOwnMapPng,
      name: 'Your own map',
      handleClick: handleCreateYourOwnMapClick,
    },
  ]

  if (isFetching) return null

  return (
    <div ref={ref} className={classes.div}>
      <Dialog
        fullWidth
        maxWidth="lg"
        className={classes.root}
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">What would you like to do?</DialogTitle>
        <DialogContent>
          <TemplateMaps data={Math.random() < 0.5 ? data : dataAlternative} classes={classes} />
          <Typography align="right">
            I just want to{' '}
            <Link className={classes.link} onClick={() => push('/maps')}>
              <b>try out the tool</b>
            </Link>
          </Typography>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FirstLoginDialog
