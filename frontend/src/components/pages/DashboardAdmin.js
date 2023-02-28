import React from 'react'

import StickyHeadTable from './CRM/CRMAdmin'

import useApiQuery from '../../hooks/useApiQuery'
import {ROLES} from '../../shared/config/constants'
import useAuth from '../../hooks/useAuth'

const DashboardAdmin = () => {
  // eslint-disable-next-line no-unused-vars
  const {auth} = useAuth()

  const {data, isFetching} = useApiQuery({
    url: '/statistics/users',
    cacheTime: 60 * 60 * 1000,
    staleTime: 60 * 60 * 1000,
  })

  if ((isFetching && !data) || !auth?.roles || !auth.roles.includes(ROLES.administrator)) return null

  return <StickyHeadTable data={data} />
}

export default DashboardAdmin
