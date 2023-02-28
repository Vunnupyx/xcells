import React, {useCallback} from 'react'
import {FormattedMessage} from 'react-intl'
import {useHistory} from 'react-router-dom'

import Chip from '@material-ui/core/Chip'

import Table from '../../table/Table'
import AgoMoment from '../../table/AgoMoment'

const Title = ({cell: {value}, row: {original}}) => (
  <>
    {value}
    {original.share && original.share.public && original.share.public.enabled ? (
      <>
        {' '}
        <Chip size="small" label={<FormattedMessage id="mapIsPublic" />} color="primary" />
      </>
    ) : null}
  </>
)

const columns = [
  {
    Header: <FormattedMessage id="mapTitle" />,
    accessor: 'title',
    Cell: Title,
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
]

const MapTable = ({data}) => {
  const {push} = useHistory()

  const rowClick = useCallback(({original: {mapId}}) => push(`/maps/${mapId}`), [push])
  const rowMiddleClick = useCallback(({original: {mapId}}) => window.open(`/maps/${mapId}`), [])

  return <Table data={data} columns={columns} rowClick={rowClick} rowMiddleClick={rowMiddleClick} />
}
export default MapTable
