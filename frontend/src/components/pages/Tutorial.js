import React from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import ReactPlayer from 'react-player'
import {FormattedMessage, useIntl} from 'react-intl'
import Box from '@material-ui/core/Box'

const videoUrls = {
  de: {
    tutorials: [],
    useCases: [],
    introductions: [],
    examples: [],
  },
  en: {
    tutorials: [
      {
        url: 'https://www.youtube.com/watch?v=LJOzp6NCeoU',
        title: 'Infinity Maps Tutorial #1 - Quick Intro',
      },
      {
        url: 'https://www.youtube.com/watch?v=eJ4O9CVgvO0',
        title: 'Infinity Maps Tutorial #2 - Basics',
      },
      {
        url: 'https://www.youtube.com/watch?v=Xs-9gAO6n98',
        title: 'Infinity Maps Tutorial #3 - Navigation',
      },
      {
        url: 'https://www.youtube.com/watch?v=4fbqfnSVsFc',
        title: 'Infinity Maps Tutorial #4 - Card editing & text',
      },
      {
        url: 'https://www.youtube.com/watch?v=78TepYI6o10',
        title: 'Infinity Maps Tutorial #5 - Resize & rescale',
      },
      {
        url: 'https://www.youtube.com/watch?v=fZWw6iSlWhs',
        title: 'Infinity Maps Tutorial #6 - Connections & colors',
      },
      {
        url: 'https://www.youtube.com/watch?v=KIeacGBR2fU',
        title: 'Infinity Maps Tutorial #7 - Templates',
      },
      {
        url: 'https://www.youtube.com/watch?v=5eweAa39MxQ',
        title: 'Infinity Maps Tutorial #8 - Sharing',
      },
    ],
    useCases: [
      {
        url: 'https://www.youtube.com/watch?v=5BkqwZOfIEg',
        title: 'Mind Map, Whiteboard, Notizbuch? Finde die richtige Methode für deine Ideen und Projekte',
      },
      {
        url: 'https://www.youtube.com/watch?v=Ad8Aznx5x-4',
        title: 'Infinity Maps: Wissens-Tool für Studium & Promotion',
      },
      {
        url: 'https://www.youtube.com/watch?v=2Vf3SYounB8',
        title: 'Infinity Maps: Wissens-Tool für Studium & Promotion',
      },
      {
        url: 'https://www.youtube.com/watch?v=MleIsQ14WWo',
        title: 'Infinity Maps - also a tool for Startups and Makers',
      },
    ],
    introductions: [
      {
        url: 'https://www.youtube.com/watch?v=nWXXOz0OgtA',
        title: '1 Mio Daten in einer Map: Infinity Maps Life Demo beim InnovationFestival 2020 von karlsruhe.digital',
      },
      {
        url: 'https://www.youtube.com/watch?v=v6J7AEN-qXw',
        title: 'Imapping Method - Short Intro',
      },
      {
        url: 'https://www.youtube.com/watch?v=GblI7GI0jQ4',
        title: 'Introduction of the imapping method (mind mapping alternative)',
      },
      {
        url: 'https://www.youtube.com/watch?v=_8lrybdqVQo',
        title: 'Infinity Maps - whats different to Miro and Notion?',
      },
    ],
    examples: [
      {
        url: 'https://www.youtube.com/watch?v=AIvMehgWU5E',
        title: 'Infinity Maps demo - metabolism/biochemistry, stoffwechsel/biochemie',
      },
      {
        url: 'https://www.youtube.com/watch?v=Z0q9nIy2m94',
        title: 'Infinity Maps demo - All-in-1-Map Workspace',
      },
      {
        url: 'https://www.youtube.com/watch?v=lkFQPXf1qdM',
        title: 'Infinity Maps Erklärung Deutsch & Live Demo',
      },
      {
        url: 'https://www.youtube.com/watch?v=PgEtktuXQ1g',
        title: 'Infinity Maps demo - the known universe',
      },
      {
        url: 'https://www.youtube.com/watch?v=Uzw13En-nlY',
        title: 'Infinity Maps demo - Organizational chart',
      },
    ],
  },
}

const VideoGrid = ({videos}) => (
  <Grid container spacing={1}>
    {videos.map(({url, title}) => (
      <Grid key={url} item container direction="column" xs={12} sm={6} md={4} lg={3} xl={2}>
        <Grid item>
          <ReactPlayer url={url} controls height="100%" width="100%" />
        </Grid>
        <Grid item>
          <Typography variant="body1">{title}</Typography>
        </Grid>
      </Grid>
    ))}
  </Grid>
)

const Tutorial = () => {
  const {locale} = useIntl()
  return (
    <Grid container direction="column" spacing={3} component={Box} p={3}>
      <Grid item>
        <Typography variant="h4" gutterBottom>
          <FormattedMessage id="homeVideoTutorials" />
        </Typography>
        <VideoGrid videos={videoUrls[locale].tutorials} />
      </Grid>
      <Grid item>
        <Typography variant="h4" gutterBottom>
          <FormattedMessage id="homeVideoUseCases" />
        </Typography>
        <VideoGrid videos={videoUrls[locale].useCases} />
      </Grid>
      <Grid item>
        <Typography variant="h4" gutterBottom>
          <FormattedMessage id="homeVideoIntroductions" />
        </Typography>
        <VideoGrid videos={videoUrls[locale].introductions} />
      </Grid>
      <Grid item>
        <Typography variant="h4" gutterBottom>
          <FormattedMessage id="homeVideoExamples" />
        </Typography>
        <VideoGrid videos={videoUrls[locale].examples} />
      </Grid>
    </Grid>
  )
}

export default Tutorial
