import React, {useState} from 'react'
import {FormattedMessage} from 'react-intl'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'

import Grid from '@material-ui/core/Grid'
import makeStyles from '@material-ui/styles/makeStyles'
import useMapStore from '../../hooks/useMapStore'
import parseColor from '../../engine/utils/parseColor'
import TagDialog, {NEW_ID} from './TagDialog'

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

const ManageTagsDialog = ({open, onClose}) => {
  const {tags} = useMapStore()
  const [tagId, setTagId] = useState(false)
  const classes = useStyles()

  return (
    <Dialog classes={{paper: classes.dialog}} open={open} onClose={onClose}>
      <DialogTitle>
        <FormattedMessage id="dialog.manageTags.title" />
      </DialogTitle>

      <DialogContent>
        <Grid container direction="column">
          {tags.map(({name, color, id}) => {
            const parsedColor = parseColor(color)
            return (
              <Grid item key={id}>
                <Button
                  onClick={() => setTagId(id)}
                  className={classes.button}
                  style={{
                    backgroundColor: parsedColor.background.hex(),
                    color: parsedColor.text.hex(),
                  }}
                  fullWidth
                  variant="contained"
                >
                  {name}
                </Button>
              </Grid>
            )
          })}
          <Grid item className={classes.divider}>
            <Button className={classes.button} onClick={() => setTagId(NEW_ID)} fullWidth variant="outlined">
              <FormattedMessage id="dialog.manageTags.create" />
            </Button>
          </Grid>
        </Grid>
        {tagId ? <TagDialog open onClose={() => setTagId(false)} id={tagId} /> : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          <FormattedMessage id="button.close" />
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ManageTagsDialog
