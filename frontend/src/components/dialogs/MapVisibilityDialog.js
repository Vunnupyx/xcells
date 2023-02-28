import React from 'react'
import {FormattedMessage} from 'react-intl'

import CheckIcon from '@material-ui/icons/Check'

import Button from '@material-ui/core/Button'
import PeopleOutlineIcon from '@material-ui/icons/PeopleOutline'

import PublicIcon from '@material-ui/icons/PublicOutlined'
import HomeRoundedIcon from '@material-ui/icons/HomeRounded'
import PropTypes from 'prop-types'
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined'
import {useQueryCache} from 'react-query'
import ListItemText from '@material-ui/core/ListItemText'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import DialogContentText from '@material-ui/core/DialogContentText'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import useApiMutation from '../../hooks/useApiMutation'
import MobileDialog from '../MobileDialog'
import {ROLES} from '../../shared/config/constants'
import HiddenForOtherRoles from '../hide/HiddenForOtherRoles'
import {track} from '../../contexts/tracking'
import useApiQuery from '../../hooks/useApiQuery'

const trackAction = status => {
  track({action: 'mapVisibility', details: {status}})
}

const MapVisibilityDialog = ({mapId, open, onClose}) => {
  const queryCache = useQueryCache()

  const {data: map} = useApiQuery({url: `/maps/${mapId}`})

  const [setMapVisibility] = useApiMutation({
    url: `/maps/${mapId}/share/public`,
    onSuccess: () => queryCache.refetchQueries(['maps']),
  })

  if (!map) return null

  const isPublic = map.share?.public?.enabled
  const isHidden = map.share?.public?.hidden
  const isWriteable = map.share?.public?.writeable

  return (
    <MobileDialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogTitle style={{marginLeft: -10}}>
          <FormattedMessage id="dialogMapPrivacyTitle" />
        </DialogTitle>
        <DialogContentText style={{marginLeft: 15, marginTop: 0, marginBottom: 0}} align="left">
          <FormattedMessage id="dialogMapPrivacyMessage" />
        </DialogContentText>
        <List>
          <ListItem
            button
            onClick={() => {
              setMapVisibility({body: {enabled: false}})
              onClose()
              trackAction('private')
            }}
          >
            <ListItemIcon>
              <HomeRoundedIcon fontSize="large" color="primary" />
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{color: 'primary'}}
              primary={<FormattedMessage id="buttonUnshare" />}
              secondary={<FormattedMessage id="buttonUnshareMessage" />}
            />
            <ListItemSecondaryAction>
              {!isPublic ? <CheckIcon style={{fontSize: 40, marginLeft: 10}} fontSize="large" color="primary" /> : null}
            </ListItemSecondaryAction>
          </ListItem>

          <Divider variant="middle" />
          <ListItem
            button
            onClick={() => {
              setMapVisibility({body: {enabled: true, hidden: true}})
              onClose()
              trackAction('public unlisted')
            }}
          >
            <ListItemIcon>
              <PeopleOutlineIcon fontSize="large" style={{fontSize: 40}} color="primary" />
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{color: 'primary'}}
              primary={<FormattedMessage id="buttonShareHidden" />}
              secondary={<FormattedMessage id="buttonShareHiddenMessage" />}
            />
            <ListItemSecondaryAction>
              {isPublic && !isWriteable && isHidden ? (
                <CheckIcon style={{marginLeft: 10}} fontSize="large" color="primary" />
              ) : null}
            </ListItemSecondaryAction>
          </ListItem>
          <Divider variant="middle" />
          <ListItem
            button
            onClick={() => {
              setMapVisibility({body: {enabled: true, hidden: false}})
              onClose()
              trackAction('public')
            }}
          >
            <ListItemIcon>
              <PublicIcon fontSize="large" style={{fontSize: 40}} color="primary" />
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{color: 'primary'}}
              primary={<FormattedMessage id="buttonShare" />}
              secondary={<FormattedMessage id="buttonShareMessage" />}
            />
            <ListItemSecondaryAction>
              {isPublic && !isWriteable && !isHidden ? (
                <CheckIcon style={{marginLeft: 10}} fontSize="large" color="primary" />
              ) : null}
            </ListItemSecondaryAction>
          </ListItem>

          <Divider variant="middle" />

          <ListItem
            button
            onClick={() => {
              setMapVisibility({body: {enabled: true, hidden: true, writeable: true}})
              onClose()
              trackAction('public unlisted writeable')
            }}
          >
            <ListItemIcon>
              <CreateOutlinedIcon fontSize="large" style={{fontSize: 40}} color="primary" />
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{color: 'primary'}}
              primary={<FormattedMessage id="buttonShareWritableHidden" />}
              secondary={<FormattedMessage id="buttonShareWritableHiddenMessage" />}
            />
            <ListItemSecondaryAction>
              {isPublic && isWriteable && isHidden ? (
                <CheckIcon style={{marginLeft: 10}} fontSize="large" color="primary" />
              ) : null}
            </ListItemSecondaryAction>
          </ListItem>

          <Divider variant="middle" />

          <HiddenForOtherRoles roles={[ROLES.administrator]}>
            <ListItem
              button
              onClick={() => {
                setMapVisibility({body: {enabled: true, hidden: false, writeable: true}})
                onClose()
              }}
            >
              <ListItemIcon>
                <CreateOutlinedIcon fontSize="large" style={{fontSize: 40}} color="primary" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{color: 'primary'}}
                primary={<FormattedMessage id="buttonShareWritable" />}
                secondary={<FormattedMessage id="buttonShareWritableMessage" />}
              />
              <ListItemSecondaryAction>
                {isPublic && isWriteable && !isHidden ? (
                  <CheckIcon style={{marginLeft: 10}} fontSize="large" color="primary" />
                ) : null}
              </ListItemSecondaryAction>
            </ListItem>
          </HiddenForOtherRoles>
          <Divider variant="middle" />
        </List>
        <DialogActions>
          <Button onClick={onClose} color="default">
            <FormattedMessage id="cancel" />
          </Button>
        </DialogActions>
      </DialogContent>
    </MobileDialog>
  )
}

MapVisibilityDialog.propTypes = {
  mapId: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default MapVisibilityDialog
