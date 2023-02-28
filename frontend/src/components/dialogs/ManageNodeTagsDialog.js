import React, {useMemo, useState} from 'react'
import {useLocalStorage} from 'react-use'
import {FormattedMessage, useIntl} from 'react-intl'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import CheckIcon from '@material-ui/icons/Check'
import Grid from '@material-ui/core/Grid'
import makeStyles from '@material-ui/styles/makeStyles'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchIcon from '@material-ui/icons/Search'
import ListItem from '@material-ui/core/ListItem'

import useMapStore from '../../hooks/useMapStore'
import parseColor from '../../engine/utils/parseColor'
import useEngineControl from '../engine/useEngineControl'
import TagDialog, {NEW_ID} from './TagDialog'
import {trackAction} from '../../contexts/tracking'
import CONFIG from '../../engine/CONFIG'
import useInteractionManager from '../engine/useInteractionManager'

const useStyles = makeStyles(theme => ({
  divider: {
    marginTop: theme.spacing(2),
  },
  button: {
    textTransform: 'none',
    marginBottom: theme.spacing(1),
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
  },
  dialog: {
    minWidth: 300,
  },
}))

const searchFieldInputProps = {
  startAdornment: (
    <InputAdornment position="start">
      <SearchIcon />
    </InputAdornment>
  ),
}

const ManageNodeTagsDialog = ({open, onClose}) => {
  const {mapId, tags} = useMapStore()
  const control = useEngineControl()
  const classes = useStyles()
  const {formatMessage} = useIntl()
  const [inputValue, setInputValue] = useLocalStorage(`manageNodeTagsDialog-inputValue-${mapId}`, '')
  const [showAll, setShowAll] = useState(false)

  const [showNewDialog, setShowNewDialog] = useState(false)

  const {lastSelectedNode: node} = useInteractionManager()

  const filteredTags = useMemo(() => {
    const words = inputValue.split(' ')
    return tags.filter(({name}) => words.every(w => name.includes(w)))
  }, [inputValue, tags])

  const limitedTags = useMemo(() => filteredTags.slice(0, CONFIG.nodes.tags.searchThreshold), [filteredTags])

  if (!node) return null

  return (
    <Dialog classes={{paper: classes.dialog}} open={open} onClose={onClose}>
      <DialogTitle>
        <FormattedMessage id="dialog.manageNodeTags.title" />
      </DialogTitle>

      <DialogContent>
        <Grid container direction="column">
          {tags.length > CONFIG.nodes.tags.searchThreshold ? (
            <ListItem disableGutters>
              <TextField
                type="search"
                autoFocus
                fullWidth
                placeholder={formatMessage({id: 'dialog.manageNodeTags.searchPlaceholder'})}
                InputProps={searchFieldInputProps}
                onChange={event => setInputValue(event.target.value)}
                value={inputValue}
              />
            </ListItem>
          ) : null}
          {(showAll ? filteredTags : limitedTags).map(({name, color, id}) => {
            const parsedColor = parseColor(color)
            return (
              <Grid item key={id}>
                <Button
                  onClick={() => {
                    control.toggleTag(id)
                    trackAction('toggleTag', {id})
                  }}
                  className={classes.button}
                  style={{
                    backgroundColor: parsedColor.background.hex(),
                    color: parsedColor.text.hex(),
                  }}
                  fullWidth
                  variant="contained"
                  startIcon={node.tags?.includes(id) ? <CheckIcon /> : null}
                >
                  {name}
                </Button>
              </Grid>
            )
          })}
          {filteredTags.length > limitedTags.length ? (
            <Grid item container alignItems="flex-end" direction="column">
              <Grid item>
                <Button onClick={() => setShowAll(s => !s)}>
                  {showAll ? (
                    <FormattedMessage id="dialog.manageNodeTags.showLess" />
                  ) : (
                    <FormattedMessage id="dialog.manageNodeTags.showAll" />
                  )}
                </Button>
              </Grid>
            </Grid>
          ) : null}
          <Grid item className={classes.divider}>
            <Button className={classes.button} onClick={() => setShowNewDialog(true)} fullWidth variant="outlined">
              <FormattedMessage id="dialog.manageNodeTags.create" />
            </Button>
          </Grid>
        </Grid>
        {showNewDialog ? (
          <TagDialog
            open
            id={NEW_ID}
            onClose={() => setShowNewDialog(false)}
            onSubmit={tag => control.toggleTag(tag.id)}
          />
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          <FormattedMessage id="button.close" />
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ManageNodeTagsDialog
