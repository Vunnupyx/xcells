import React, {useCallback, useMemo} from 'react'
import {FormattedMessage} from 'react-intl'
import {Field, Form} from 'react-final-form'
import {TextField} from 'mui-rff'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'

import useMapStore from '../../hooks/useMapStore'
import {changeTagColor, changeTagName, createTag} from '../../store/actions'
import ColorPickerField from '../../input/ColorPickerField'
import {generateTagId} from '../../shared/utils/generateId'
import {trackAction} from '../../contexts/tracking'

export const NEW_ID = 'new'

const nameRequired = value => (value ? null : <FormattedMessage id="dialog.tag.errors.nameRequired" />)
const colorRequired = value => (value ? null : <FormattedMessage id="dialog.tag.errors.colorRequired" />)
const nameExists = (tags, value) =>
  tags.find(t => t.name === value) ? <FormattedMessage id="dialog.tag.errors.nameExists" /> : null

const TagDialog = ({open, onClose, onSubmit = () => undefined, id}) => {
  const {tags, dispatch} = useMapStore()

  const tag = useMemo(() => id !== NEW_ID && tags.find(t => t.id === id), [tags, id])

  const onSubmitWrapped = useCallback(
    values => {
      if (id === NEW_ID) {
        values.id = generateTagId()
        dispatch(createTag(values))
        trackAction('createTag', {id: values.id})
      } else {
        dispatch([changeTagName(values), changeTagColor(values)])
        trackAction('editTag', {id: values.id})
      }
      onSubmit(values)
      onClose()
    },
    [id, onSubmit, onClose, dispatch],
  )

  const nameValidate = useCallback(
    value => {
      const nameRequiredError = nameRequired(value)
      if (nameRequiredError) return nameRequiredError
      return nameExists(tags, value)
    },
    [tags],
  )

  return (
    <Dialog open={open} onClose={onClose}>
      <Form onSubmit={onSubmitWrapped} initialValues={tag}>
        {({handleSubmit}) => (
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {tag ? <FormattedMessage id="dialog.tag.update" /> : <FormattedMessage id="dialog.tag.create" />}
            </DialogTitle>
            <DialogContent>
              <input type="hidden" name="id" value={id === NEW_ID ? null : id} />
              <Grid container direction="column" spacing={2}>
                <Grid item>
                  <TextField
                    name="name"
                    label={<FormattedMessage id="dialog.tag.fields.name" />}
                    fieldProps={{validate: nameValidate}}
                  />
                </Grid>
                <Grid item>
                  <Field name="color" component={ColorPickerField} validate={colorRequired} />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>
                <FormattedMessage id="cancel" />
              </Button>
              <Button onClick={handleSubmit}>
                <FormattedMessage id="save" />
              </Button>
            </DialogActions>
          </form>
        )}
      </Form>
    </Dialog>
  )
}

export default TagDialog
