import React, {useCallback, useState} from 'react'
import {Field, Form} from 'react-final-form'
import {useQueryCache} from 'react-query'
import {FormattedMessage, useIntl} from 'react-intl'

import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import CloseIcon from '@material-ui/icons/Close'
import makeStyles from '@material-ui/styles/makeStyles'
import AddIcon from '@material-ui/icons/Add'
import Chip from '@material-ui/core/Chip'

import TextField from '../../../../input/TextField'
import useApiMutation from '../../../../hooks/useApiMutation'

const useStyles = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}))

const MapCategory = ({mapId, map}) => {
  const classes = useStyles()
  const {formatMessage} = useIntl()
  const queryCache = useQueryCache()
  const [open, setOpen] = useState(false)

  const onClose = () => {
    setOpen(false)
  }
  const onOpen = () => {
    setOpen(true)
  }

  const [saveCategory] = useApiMutation({
    url: `/maps/${mapId}/category`,
    onSuccess: () => queryCache.refetchQueries(['maps']),
  })

  const onDelete = useCallback(() => {
    saveCategory({body: {category: null}})
  }, [saveCategory])

  const onSubmit = useCallback(
    async ({category}) => {
      await saveCategory({body: {category}})
      setOpen(false)
    },
    [saveCategory, setOpen],
  )

  return (
    <>
      {map.category ? (
        <Chip
          color="primary"
          size="small"
          className={classes.tag}
          onClick={onOpen}
          onDelete={onDelete}
          label={map.category}
          title={formatMessage({id: 'mapAddCategoryTooltip'})}
        />
      ) : (
        <Chip
          variant="outlined"
          size="small"
          avatar={<AddIcon />}
          onClick={onOpen}
          label={<FormattedMessage id="mapAddCategoryLabel" />}
          title={formatMessage({id: 'mapAddCategoryTooltip'})}
        />
      )}

      {open ? (
        <Dialog open={open} onClose={onClose}>
          <Form
            onSubmit={onSubmit}
            render={({handleSubmit, submitting}) => (
              <form onSubmit={handleSubmit}>
                <DialogTitle>
                  <FormattedMessage id="mapAddCategoryLabel" />
                  <IconButton aria-label="close" onClick={onClose} className={classes.closeButton}>
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>

                <DialogContent>
                  <Field
                    component={TextField}
                    fullWidth
                    margin="dense"
                    id="category"
                    label="Category"
                    name="category"
                    autoFocus
                    disabled={submitting}
                    initialValue={map.category}
                  />
                </DialogContent>

                <DialogActions>
                  <Button onClick={onClose}>
                    <FormattedMessage id="cancel" />
                  </Button>
                  <Button color="primary" onClick={handleSubmit}>
                    <FormattedMessage id="save" />
                  </Button>
                </DialogActions>
              </form>
            )}
          />
        </Dialog>
      ) : null}
    </>
  )
}
export default MapCategory
