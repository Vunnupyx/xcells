import React from 'react'
import {FormattedMessage} from 'react-intl'

import useAuth from '../../hooks/useAuth'
import Table from '../table/Table'
import AgoMoment from '../table/AgoMoment'
import useApiQuery from '../../hooks/useApiQuery'
import {ROLES} from '../../shared/config/constants'

const getRowId = row => row._id

const overflowStyle = {overflowX: 'scroll'}

const Json = ({cell: {value}}) => (
  <div style={overflowStyle}>
    <pre>{JSON.stringify(value, null, 2).replaceAll('\\n', '\n')}</pre>
  </div>
)
const Backtrace = ({cell: {value}}) => (
  <div style={overflowStyle}>
    <pre>{value}</pre>
  </div>
)

const columns = [
  {
    Header: <FormattedMessage id="clientErrorUserId" />,
    accessor: 'userId',
  },
  {
    Header: <FormattedMessage id="clientErrorPath" />,
    accessor: 'path',
  },
  {
    Header: <FormattedMessage id="clientErrorBacktrace" />,
    accessor: 'backtrace',
    Cell: Backtrace,
  },
  {
    Header: <FormattedMessage id="clientErrorAdditions" />,
    accessor: 'additions',
    Cell: Json,
  },
  {
    Header: <FormattedMessage id="created" />,
    accessor: 'createdAt',
    Cell: AgoMoment,
  },
]

const tableContainerStyle = {marginTop: 48}

const ErrorAdmin = () => {
  const {auth} = useAuth()
  const {data, isFetching} = useApiQuery({url: '/errors'})

  if ((isFetching && !data) || !auth?.roles || !auth.roles.includes(ROLES.administrator)) return null

  return (
    <div style={tableContainerStyle}>
      <Table getRowId={getRowId} columns={columns} data={data || []} size="small" stickyHeader />
    </div>
  )
}

export default ErrorAdmin
