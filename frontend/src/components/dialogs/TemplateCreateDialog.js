import React, {useCallback} from 'react'
import PropTypes from 'prop-types'
import {FormattedMessage, useIntl} from 'react-intl'
import {Field, Form} from 'react-final-form'

import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import CloseIcon from '@material-ui/icons/Close'
import makeStyles from '@material-ui/styles/makeStyles'

import TextField from '../../input/TextField'
import HiddenForOtherRoles from '../hide/HiddenForOtherRoles'
import useMapStore from '../../hooks/useMapStore'
import {duplicateNode} from '../../store/utils'
import useApi from '../../hooks/useApi'
import useSnackbar from '../../hooks/useSnackbar'
import useApiMutation from '../../hooks/useApiMutation'
import Checkbox from '../../input/Checkbox'
import {track} from '../../contexts/tracking'
import useInteractionManager from '../engine/useInteractionManager'

const useStyles = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}))

const TemplateCreateDialog = ({open, onClose}) => {
  const {formatMessage} = useIntl()
  const classes = useStyles()
  const {selectedNodes} = useInteractionManager()
  const mapStore = useMapStore()
  const api = useApi()
  const {success} = useSnackbar()

  const sendTemplate = useCallback(
    ({name, keywords: keywordString, share}) => {
      if (!selectedNodes.size) return Promise.reject()

      const keywords = keywordString ? keywordString.split(',').map(k => k.trim()) : undefined

      const template = {
        name,
        keywords,
        share,
        nodes: {},
        edges: {},
      }

      const {id} = [...selectedNodes][selectedNodes.size - 1]

      template.root = duplicateNode(template, mapStore, id)

      return api.post('/templates', {body: template})
    },
    [api, mapStore, selectedNodes],
  )

  const [onSubmit] = useApiMutation({
    fn: sendTemplate,
    onSuccess: () => {
      success(<FormattedMessage id="templateSaveSuccess" />)
      onClose()
    },
  })

  return (
    <Dialog open={open} onClose={onClose}>
      <Form
        onSubmit={onSubmit}
        render={({handleSubmit, submitting}) => (
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              <FormattedMessage id="templateCreateTitle" />
              <IconButton aria-label="close" onClick={onClose} className={classes.closeButton}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent>
              <Field
                component={TextField}
                margin="normal"
                required
                fullWidth
                id="name"
                label={<FormattedMessage id="templateName" />}
                name="name"
                autoFocus
                disabled={submitting}
                initialValue={[...selectedNodes][0].title}
              />
              <Field
                component={TextField}
                margin="normal"
                fullWidth
                id="keywords"
                label={<FormattedMessage id="templateKeywords" />}
                name="keywords"
                disabled={submitting}
              />

              <HiddenForOtherRoles roles={['administrator']}>
                <FormControlLabel
                  labelPlacement="start"
                  control={
                    <Field
                      name="share.public"
                      component={Checkbox}
                      margin="normal"
                      value="unnecessary"
                      color="primary"
                      title={formatMessage({id: 'templateIsPublic'})}
                      disabled={submitting}
                    />
                  }
                  label={<FormattedMessage id="templateIsPublic" />}
                />
              </HiddenForOtherRoles>

              {/* TODO: Selection to update an existing one */}
            </DialogContent>

            <DialogActions>
              <Button onClick={onClose}>
                <FormattedMessage id="cancel" />
              </Button>
              <Button
                color="primary"
                onClick={() => {
                  track({action: 'templateAdd', details: {method: 'create'}})
                  handleSubmit()
                }}
              >
                <FormattedMessage id="create" />
              </Button>
            </DialogActions>
          </form>
        )}
      />
    </Dialog>
  )
}

TemplateCreateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default TemplateCreateDialog
