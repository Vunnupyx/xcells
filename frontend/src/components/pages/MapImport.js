import React, {useEffect, useRef} from 'react'
import {useHistory, useLocation, useParams} from 'react-router-dom'
import Dropzone from 'react-dropzone'
import clsx from 'clsx'

import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import makeStyles from '@material-ui/styles/makeStyles'
import RootRef from '@material-ui/core/RootRef'
import Grid from '@material-ui/core/Grid'
import {FormattedMessage} from 'react-intl'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Card from '@material-ui/core/Card'

import CardContent from '@material-ui/core/CardContent'
import useImportMap from '../../hooks/useImportMap'
import useSnackbar from '../../hooks/useSnackbar'
import useApi from '../../hooks/useApi'
import spinnerSrc from '../../assets/spinner.apng'
import {center} from '../../styles/styles'
import {feedback} from '../../intl/links'

const IGNORE_WAITFOR_TIMEOUT = 60 * 7
const IMPORT_TIMEOUT = 60 * 5
const CHECK_UPLOAD_TIMEOUT = 10

const useStyles = makeStyles(theme => ({
  dropzone: {
    padding: theme.spacing(2),
    minHeight: '100%',
  },
  icon: {
    fontSize: 250,
    color: '#999',
  },
  wrapper: {
    textAlign: 'center',
    ...center,
  },
}))

const pastSeconds = start => {
  return new Date().getTime() / 1000 - start
}

const Spinner = ({messageId}) => {
  const classes = useStyles()

  return (
    <div className={clsx([classes.wrapper, 'progressSpinner'])}>
      <div>
        <FormattedMessage id={messageId} />
      </div>
      <div>
        <img src={spinnerSrc} width={100} alt="Loading ..." />
      </div>
    </div>
  )
}

export const MapImportCreate = () => {
  const {state} = useLocation()
  const api = useApi()
  const {replace} = useHistory()
  const {error} = useSnackbar()
  const {mapId} = useParams()

  const {wait, uploadTime} = state || {}

  useEffect(() => {
    if (mapId && wait && pastSeconds(uploadTime) <= IGNORE_WAITFOR_TIMEOUT) {
      let abort = false

      // eslint-disable-next-line
      const waiting = async () => {
        let uploadDone = false
        while (pastSeconds(uploadTime) < IMPORT_TIMEOUT && !uploadDone) {
          try {
            // eslint-disable-next-line no-await-in-loop
            const {exists} = await api.get(`/maps/${mapId}/exists`, {ignoreErrors: true})
            uploadDone = exists
          } catch (e) {
            // nothing
          }
          if (!uploadDone) {
            // eslint-disable-next-line no-await-in-loop
            await new Promise(r => {
              setTimeout(r, CHECK_UPLOAD_TIMEOUT * 1000)
            })
          }
          if (abort) return
        }

        if (uploadDone) {
          replace(`/maps/${mapId}`, state)
        } else {
          error(<FormattedMessage id="mapUploadError" />)
          replace('/maps')
        }
      }
      waiting().then()
      return () => (abort = true)
    }

    replace(`/maps/${mapId}`, state)
    return () => {}
  }, [state, mapId, wait, uploadTime, error, replace, api])

  return <Spinner messageId="importSpinner" />
}

const MapImport = () => {
  const classes = useStyles()
  const [uploadMap, {status}] = useImportMap()
  const uploadInputRef = useRef(null)

  const isFetching = status === 'loading'

  return (
    <Dropzone ref={uploadInputRef} multiple={false} onDrop={uploadMap}>
      {({getRootProps, getInputProps}) => {
        const {ref, onClick, ...rootProps} = getRootProps()
        if (isFetching)
          return (
            <RootRef rootRef={ref}>
              <Spinner messageId="uploadSpinner" />
            </RootRef>
          )

        return (
          <RootRef rootRef={ref}>
            <Grid
              container
              {...rootProps}
              className={classes.dropzone}
              direction="column"
              justifyContent="center"
              alignItems="center"
            >
              <input {...getInputProps()} />
              <Card>
                <CardContent>
                  <Grid item component={Box} maxWidth={450} textAlign="center">
                    <CloudUploadIcon className={classes.icon} />
                    <Typography variant="h4" gutterBottom>
                      <FormattedMessage id="import.title" />
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <FormattedMessage id="import.message" />
                    </Typography>
                    <List dense>
                      {['txt', 'json', 'imap'].map(type => (
                        <ListItem key={type}>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon color="primary" fontSize="large" />
                          </ListItemIcon>
                          <ListItemText
                            primary={<FormattedMessage id={`import.types.${type}.primary`} />}
                            secondary={<FormattedMessage id={`import.types.${type}.secondary`} />}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Typography variant="body1" component="p" gutterBottom>
                      <FormattedMessage id="import.suggestMore" values={{feedback}} />
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={event => {
                        event.stopPropagation()
                        uploadInputRef.current.open()
                      }}
                      color="primary"
                    >
                      <FormattedMessage id="import.button" />
                    </Button>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </RootRef>
        )
      }}
    </Dropzone>
  )
}

export default MapImport
