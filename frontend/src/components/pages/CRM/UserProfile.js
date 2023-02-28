import React, {useEffect, useMemo, useState} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import {FormattedMessage} from 'react-intl'
import makeStyles from '@material-ui/styles/makeStyles'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'

import useApiQuery from '../../../hooks/useApiQuery'
import useApiMutation from '../../../hooks/useApiMutation'
import {ROLES} from '../../../shared/config/constants'
import useSnackbar from '../../../hooks/useSnackbar'
import {setMixpanelUserProfileStats} from '../../../utils/tracking/trackingcode'

// eslint-disable-next-line no-unused-vars
const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '25ch',
    },
  },
  button: {
    top: '5%',
  },
  tableRowGreyedOut: {
    opacity: 0.5,
  },
}))

function convertDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

const SurveyContainer = ({userData, classes}) => {
  const surveyData = Object.fromEntries(
    Object.entries(userData.meta.store)
      .map(([k, v]) => {
        if (k === 'fieldsOfWork') {
          if (Object.values(v).every(f => f === null)) return [k, null]
          return [
            k,
            Object.values(v)
              .filter(val => val !== null)
              .toString(),
          ]
        }
        return [k, v]
      })
      .filter(([, v]) => v !== null),
  )
  if (Object.keys(surveyData).length) {
    return (
      <Card className={classes.surveyCard}>
        <CardContent>
          <Typography className={classes.title} color="textSecondary" gutterBottom>
            Survey Data
          </Typography>
          {Object.entries(surveyData).map(([key, value]) => {
            if (value)
              return (
                <Typography key={key} gutterBottom>
                  <b>{key}: </b> {value}
                </Typography>
              )
            return null
          })}
        </CardContent>
      </Card>
    )
  }
  return null
}

const UserMaps = ({userData, rows, classes}) => {
  if (rows.length > 0)
    return (
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Map (Id)</TableCell>
              <TableCell align="right">Node Count</TableCell>
              <TableCell align="right">Edge Count</TableCell>
              <TableCell align="right">Shared With</TableCell>
              <TableCell align="right">Free Nodes</TableCell>
              <TableCell align="right">Created At</TableCell>
              <TableCell align="right">Updated At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <TableRow className={row.userId === userData.id ? null : classes.tableRowGreyedOut} key={row.name}>
                <TableCell component="th" scope="row">
                  {row.mapId}
                </TableCell>
                <TableCell align="right">{row.nodes}</TableCell>
                <TableCell align="right">{row.edges}</TableCell>
                <TableCell align="right">{row.sharedWithCount}</TableCell>
                <TableCell align="right">
                  {userData.limitNodes !== null ? userData.limitNodes - row.nodes : '-'}
                </TableCell>
                <TableCell align="right">{row.createdAt}</TableCell>
                <TableCell align="right">{row.lastMapChange}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  return null
}

const UserProfile = () => {
  const {id} = useParams()
  const history = useHistory()
  const classes = useStyles()
  const {success, error} = useSnackbar()

  const userId = id.split(',')[0]
  const wpUrl = `https://infinitymaps.io/wp-admin/user-edit.php?user_id=${userId}&wp_http_referer=%2Fwp-admin%2Fusers.php`

  const {data: mapsData = {}} = useApiQuery({
    url: `/statistics/maps/${userId}`,
    cacheTime: 60 * 60 * 1000,
    staleTime: 60 * 60 * 1000,
  })

  const {
    data: userData = {},
    isFetched,
    refetch: refetchShare,
  } = useApiQuery({
    url: `/statistics/users/${userId}`,
    cacheTime: 60 * 60 * 1000,
    staleTime: 60 * 60 * 1000,
  })

  const [updateComment] = useApiMutation({
    url: `/statistics/users/${userId}/comment`,
    onSuccess: () => {
      refetchShare()
      success(<FormattedMessage id="admin.crm.userProfile.commentSaveSuccess" />)
      setMixpanelUserProfileStats(userId, {comment: userData.comment})
    },
    onError: err => {
      const {status, message} = err
      if (status === 401) {
        error(<FormattedMessage id="errorLogin" />)
      } else if (message) {
        error(message)
      } else {
        error(<FormattedMessage id="errorUnknown" />)
      }
    },
  })

  const [value, setValue] = useState('')

  useEffect(() => {
    setValue(userData.comment)
  }, [userData.comment])

  const handleChange = event => {
    setValue(event.target.value)
  }

  const handleSaveComment = txt => {
    if (txt === userData.comment) return
    setValue(txt)
    updateComment({body: {data: txt.toString()}})
  }

  const rows = useMemo(
    () =>
      Object.values(mapsData).map(val => ({
        mapId: val.mapId,
        nodes: val.mapNodeCount,
        edges: val.mapEdgeCount,
        userId: val.userId,
        sharedWithCount: val.sharedWithCount,
        createdAt: convertDate(val.createdAt),
        lastMapChange: convertDate(val.updatedAt),
      })),
    [mapsData],
  )

  if (!isFetched && !userData?.length) return null

  return (
    <div>
      <Grid container direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={5}>
        <Grid item xs={1}>
          <Button
            onClick={() => history.goBack()}
            className={classes.button}
            variant="contained"
            color="secondary"
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
        </Grid>
        <Grid item xs={10}>
          <Grid container spacing={5}>
            <Grid item xs={5}>
              <Grid item>
                <CardContent>
                  <Typography gutterBottom variant="h5">
                    <b>User Id:</b> {userData.id}
                  </Typography>
                  <Typography gutterBottom>
                    <b>Name:</b> {userData.name}
                  </Typography>
                  <Typography gutterBottom>
                    <b>Mail: </b>
                    <a href={`mailto:${userData.mail}`}>{userData.mail}</a>
                  </Typography>
                  <Typography gutterBottom>
                    <a href={wpUrl} target="_blank" rel="noreferrer">
                      Wordpress Profile
                    </a>
                  </Typography>
                  <br />
                  <Typography gutterBottom>
                    <b>Map Count: </b>
                    {userData.mapCount}
                  </Typography>
                  <Typography gutterBottom>
                    <b>Shared Maps: </b>
                    {userData.mapShareCount}
                  </Typography>
                  <Typography gutterBottom>
                    <b>Shared With Count: </b>
                    {userData.sharedWithCount}
                  </Typography>
                  <Typography gutterBottom>
                    <b>Node Count: </b>
                    {userData.nodeCount}
                  </Typography>
                  <Typography gutterBottom>
                    <b>Max Node Count:</b> {userData.biggestMapCount}
                  </Typography>
                  <Typography gutterBottom>
                    <b>Node Limit:</b> {userData.limitNodes ? userData.limitNodes : '-'}
                  </Typography>
                  <Typography gutterBottom>
                    <b>Subscriber:</b>{' '}
                    {userData.roles?.includes(ROLES.subscriber) || userData.roles?.includes(ROLES.org_subscriber)
                      ? '✓'
                      : '✖'}
                  </Typography>
                  <Typography gutterBottom>
                    <b>Created At:</b> {convertDate(userData.createdAt)}
                  </Typography>
                  <Typography gutterBottom>
                    <b>Last Map Change:</b>
                    {convertDate(userData.lastMapChange)}
                  </Typography>
                </CardContent>
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <br />
              <br />
              <SurveyContainer userData={userData} classes={classes} />
              <br />
              <TextField
                fullWidth
                id="standard-textarea"
                defaultValue={userData.comment}
                label="Comment"
                value={value}
                onChange={handleChange}
                onBlur={() => handleSaveComment(value)}
                multiline
              />
            </Grid>
          </Grid>
          <UserMaps userData={userData} rows={rows} classes={classes} />
        </Grid>
      </Grid>
    </div>
  )
}

export default UserProfile
