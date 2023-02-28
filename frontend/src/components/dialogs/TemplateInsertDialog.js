import React, {useCallback, useMemo, useState} from 'react'
import PropTypes from 'prop-types'
import {FormattedMessage} from 'react-intl'
import {useQueryCache} from 'react-query'
import debug from 'debug'

import SearchIcon from '@material-ui/icons/Search'
import CloseIcon from '@material-ui/icons/Close'
import DeleteIcon from '@material-ui/icons/Delete'
import TextField from '@material-ui/core/TextField'
import Chip from '@material-ui/core/Chip'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import makeStyles from '@material-ui/styles/makeStyles'

import Table from '../table/Table'
import AgoMoment from '../table/AgoMoment'
import useApiQuery from '../../hooks/useApiQuery'
import useApiMutation from '../../hooks/useApiMutation'
import useAuth from '../../hooks/useAuth'

const log = debug('app:editor:TemplateInsertDialog')

const Name = ({value, row: {original}}) => (
  <>
    {value}
    {original.share && original.share.public ? (
      <>
        {' '}
        <Chip size="small" label={<FormattedMessage id="templateIsPublicShort" />} color="primary" />
      </>
    ) : null}
  </>
)

const Keywords = ({value}) => value.map(word => <Chip key={word} size="small" label={word} />)

const DeleteTemplate = ({
  row: {
    original: {_id: id, userId: templateUserId},
  },
}) => {
  const [deleteTemplate] = useApiMutation({url: `/templates/${id}`, method: 'delete'})
  const cache = useQueryCache()
  const {userId} = useAuth().auth

  const handleDeleteClick = useCallback(
    event => {
      event.stopPropagation()
      deleteTemplate().then(() => cache.refetchQueries(['/templates', null]))
    },
    [deleteTemplate, cache],
  )

  // don't show delete, if it is not our template
  if (templateUserId !== userId) return null

  return (
    <IconButton onClick={handleDeleteClick}>
      <DeleteIcon />
    </IconButton>
  )
}

const getRowId = row => row._id

const columns = [
  {
    Header: <FormattedMessage id="templateName" />,
    accessor: 'name',
    Cell: Name,
  },
  {
    Header: <FormattedMessage id="templateKeywords" />,
    accessor: 'keywords',
    Cell: Keywords,
  },
  {
    Header: <FormattedMessage id="changed" />,
    accessor: 'updatedAt',
    Cell: AgoMoment,
  },
  {
    Header: <FormattedMessage id="created" />,
    accessor: 'createdAt',
    Cell: AgoMoment,
  },
  {
    Header: '',
    id: 'actions',
    Cell: DeleteTemplate,
  },
]

const useStyles = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}))

const TemplateInsertDialog =
  (onSuccess, onCancel) =>
  // eslint-disable-next-line
  ({open, onClose}) => {
    const [filterString, setFilterString] = useState('')
    const classes = useStyles()

    const {data = [], isFetching} = useApiQuery({url: '/templates'})

    const rowClick = useCallback(
      ({original: template}) => {
        log('create template', {template})
        onSuccess(template)
        onClose()
      },
      [onClose],
    )

    const onCancelEvent = () => {
      if (onCancel) onCancel()
      onClose()
    }

    const filteredData = useMemo(() => {
      const filter = filterString ? new RegExp(filterString, 'i') : /./

      return data.filter(({name, keywords}) => filter.test(name) || keywords.find(word => filter.test(word)))
    }, [filterString, data])

    return (
      <Dialog open={open} onClose={onCancelEvent} maxWidth="lg" fullWidth>
        <DialogTitle>
          <FormattedMessage id="templateInsertTitle" />
          <IconButton aria-label="close" onClick={onCancelEvent} className={classes.closeButton}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <SearchIcon />
          <TextField onChange={event => setFilterString(event.target.value)} value={filterString} />

          <Table columns={columns} data={filteredData} rowClick={rowClick} isLoading={isFetching} getRowId={getRowId} />
        </DialogContent>

        <DialogActions>
          <Button onClick={onCancelEvent}>
            <FormattedMessage id="cancel" />
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

TemplateInsertDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}
TemplateInsertDialog.displayName = 'TemplateInsertDialog'

export default TemplateInsertDialog
