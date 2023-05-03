import React from 'react'

import useApiQuery from '../../hooks/useApiQuery'
import {ROLES} from '../../shared/config/constants'
import useAuth from '../../hooks/useAuth'
import WaitlistTable from './CRM/WaitlistTable'

const WaitlistAdmin = () => {
  const {auth} = useAuth()

  const {data, isFetching} = useApiQuery({
    url: '/statistics/waitlist',
    cacheTime: 60 * 60 * 1000,
    staleTime: 60 * 60 * 1000,
  })

  if ((isFetching && !data) || !auth?.roles || !auth.roles.includes(ROLES.administrator)) return null

  return <WaitlistTable data={data} />
}

export default WaitlistAdmin
