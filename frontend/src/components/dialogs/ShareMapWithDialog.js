import React, {useCallback, useEffect, useRef, useState} from 'react'
import Button from '@material-ui/core/Button'
import Alert from '@material-ui/lab/Alert'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import InfoIcon from '@material-ui/icons/Info'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Avatar from '@material-ui/core/Avatar'
import DeleteIcon from '@material-ui/icons/Delete'
import Divider from '@material-ui/core/Divider'
import {useQueryCache} from 'react-query'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import Box from '@material-ui/core/Box'
import CloseIcon from '@material-ui/icons/Close'
import Link from '@material-ui/core/Link'
import {FormattedMessage} from 'react-intl'
import Popover from '@material-ui/core/Popover'
import SelectRole from './SelectRole'
import useApiMutation from '../../hooks/useApiMutation'
import useApiQuery from '../../hooks/useApiQuery'
import isEmail from '../../utils/isEmail'
import {ACCESS_ROLES} from '../../shared/config/constants'
import Username from '../Username'
import {track} from '../../contexts/tracking'

const InviteLink = str => (
  <Link target="_blank" href="https://infinitymaps.io/en/invite-friends/">
    {str}
  </Link>
)

const InputLabel = ({lengthError}) => {
  if (lengthError) {
    return (
      <>
        <FormattedMessage id="shareDialog.inputLabel" />(
        <span data-testid="warn-input-label-limit" style={{color: 'red'}}>
          <FormattedMessage id="shareDialog.inputLabelLimit" />
        </span>
        )
      </>
    )
  }

  return (
    <>
      <FormattedMessage id="shareDialog.inputLabel" />
      (<FormattedMessage id="shareDialog.inputLabelLimit" />)
    </>
  )
}

const ActionAndWarningArea = ({access, autocomplete, searchTermInput, inviteLink, onClose}) => {
  const validAction = (
    <Button
      onClick={() => {
        onClose()
        track({action: 'mapShare', details: {amount: access.length}})
      }}
      color="primary"
    >
      <FormattedMessage id="shareDialog.buttons.closeDialogButton" />
    </Button>
  )

  if (searchTermInput.length > 0 && searchTermInput.includes('@') && !isEmail(searchTermInput)) {
    return (
      <Alert severity="warning">
        <FormattedMessage id="shareDialog.warnings.emailInProgress" values={{invite: inviteLink}} />
      </Alert>
    )
  }

  if (searchTermInput.length > 0 && searchTermInput.length < 3) {
    return (
      <Alert severity="warning">
        <FormattedMessage id="shareDialog.warnings.tooShort" />
      </Alert>
    )
  }
  if (autocomplete.length > 0 || searchTermInput.length === 0) {
    return validAction // User will select from the list or not searching
  }
  if (searchTermInput.length > 0 && !isEmail(searchTermInput)) {
    return (
      <Alert severity="warning">
        <FormattedMessage id="shareDialog.warnings.noUser" />
      </Alert>
    )
  }
  if (searchTermInput.length > 0 && isEmail(searchTermInput)) {
    return (
      <Alert severity="warning">
        <FormattedMessage id="shareDialog.warnings.noEmail" values={{invite: inviteLink}} />
      </Alert>
    )
  }

  return validAction
}

const ShareMapWithDialog = ({mapId, open, onClose}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [lengthError, setLengthError] = useState(false)

  useEffect(() => {
    if (searchTerm.length !== 0 && searchTerm.length < 3) {
      setLengthError(true)
    } else {
      setLengthError(false)
    }
  }, [searchTerm, setLengthError])

  const isEmailSearchTerm = isEmail(searchTerm)
  const {data: access = [], refetch: refetchShare} = useApiQuery({url: `/maps/${mapId}/share/access`})
  const {data: users} = useApiQuery({
    url: '/users/search',
    query: {query: searchTerm},
    enabled: searchTerm && !isEmailSearchTerm,
    onError: error => {
      if (error.status !== 400) {
        throw error
      }
    },
  })
  const {data: emailUser} = useApiQuery({
    url: '/users/search/mail',
    query: {query: searchTerm},
    enabled: isEmailSearchTerm,
    onError: error => {
      if (error.status !== 404) {
        throw error
      }
    },
  })

  const labeledEmails = emailUser ? [{...emailUser, label: searchTerm}] : []
  const labeledUsers = users ? users.map(p => ({...p, label: p.name})) : []
  const combined = emailUser ? labeledEmails : labeledUsers

  const infoRef = useRef()

  const [openInfo, setOpenInfo] = useState(false)
  const queryCache = useQueryCache()

  const [setMapAccess] = useApiMutation({
    url: `/maps/${mapId}/share/access`,
    onSuccess: () => {
      queryCache.invalidateQueries(['maps'])
    },
  })

  const addAccess = useCallback(
    async (id, role) => {
      // do not run, if no result is there from the backend yet
      await setMapAccess({
        body: [
          ...access.filter(s => s.subjectId !== id || s.subjectType !== 'user'),
          {
            subjectId: id,
            subjectType: 'user',
            role,
          },
        ],
      })

      await refetchShare()
    },
    [setMapAccess, access, refetchShare],
  )

  const deleteAccess = useCallback(
    async (id, type) => {
      await setMapAccess({
        body: access.filter(s => s.subjectId !== id || s.subjectType !== type),
      })

      await refetchShare()
    },
    [setMapAccess, access, refetchShare],
  )

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <Grid item component={Box} flexGrow={1}>
            <Typography variant="h6" noWrap>
              <FormattedMessage id="shareDialog.title" />
            </Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={() => setOpenInfo(i => !i)}>
              <InfoIcon ref={infoRef} data-testid="info-icon" />
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
            <Popover
              open={openInfo}
              onClose={() => setOpenInfo(false)}
              anchorEl={infoRef.current}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <Box p={2}>
                <Typography variant="h6" noWrap>
                  <FormattedMessage id="shareDialog.infoPopover.title" />
                </Typography>
                <Typography>
                  <strong>
                    <FormattedMessage id="mapShare.accessRoles.owner" />
                  </strong>{' '}
                  <FormattedMessage id="shareDialog.infoPopover.ownerExplanation" />
                </Typography>
                <Typography>
                  <strong>
                    <FormattedMessage id="mapShare.accessRoles.contributor" />
                  </strong>{' '}
                  <FormattedMessage id="shareDialog.infoPopover.contributorExplanation" />
                </Typography>
                <Typography>
                  <strong>
                    <FormattedMessage id="mapShare.accessRoles.reader" />
                  </strong>{' '}
                  <FormattedMessage id="shareDialog.infoPopover.readerExplanation" />
                </Typography>
              </Box>
            </Popover>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <FormattedMessage id="shareDialog.description" values={{invite: InviteLink}} />
      </DialogContent>
      <DialogContent>
        <Autocomplete
          freeSolo
          disableClearable
          onInputChange={(event, value) => setSearchTerm(value)}
          onChange={(event, option, reason) => {
            const {id} = option
            if (reason === 'select-option' && id) {
              addAccess(id, ACCESS_ROLES.contributor)
              setSearchTerm('')
            }
          }}
          value={searchTerm}
          options={combined}
          renderInput={props => (
            <TextField
              {...props}
              label={<InputLabel lengthError={lengthError} />}
              margin="normal"
              variant="standard"
              InputProps={{...props.InputProps, type: 'search'}}
            />
          )}
          getOptionLabel={option => (option.label !== undefined ? option.label : option)}
        />
      </DialogContent>
      <DialogContent>
        <div>
          <List dense>
            {access.map(p => (
              <div key={`${p.subjectType}-${p.subjectId}`}>
                <Grid container direction="row" justifyContent="space-between" alignItems="center">
                  <Grid item xs={11}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar alt={p.subjectId} src="" />
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Username userId={p.subjectId} />}
                        secondary={<FormattedMessage id={`shareDialog.types.${p.subjectType}`} />}
                      />
                      <ListItemSecondaryAction>
                        <SelectRole onRoleChange={r => addAccess(p.subjectId, r)} role={p.role} />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton
                      edge="start"
                      aria-label="delete"
                      onClick={() => deleteAccess(p.subjectId, p.subjectType)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
                <Divider variant="inset" />
              </div>
            ))}
          </List>
        </div>
      </DialogContent>
      <DialogActions>
        <ActionAndWarningArea
          access={access}
          autocomplete={combined}
          searchTermInput={searchTerm}
          onClose={onClose}
          inviteLink={InviteLink}
        />
      </DialogActions>
    </Dialog>
  )
}
export default ShareMapWithDialog
