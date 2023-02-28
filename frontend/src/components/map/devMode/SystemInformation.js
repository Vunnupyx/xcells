import React, {useEffect, useState} from 'react'

import {getSystemInformation} from '../../../utils/devMode/systemInformation'

// Refresh timeout in milliseconds
const REFRESH_TIMEOUT = 5000
const UNITS = 'MB'

const SystemInformation = () => {
  const {gpu, memory, heap, platform} = getSystemInformation()

  const [, rerender] = useState()

  useEffect(() => {
    const ref = setInterval(() => rerender({}), REFRESH_TIMEOUT)
    return () => clearInterval(ref)
  }, [rerender])

  return (
    <div>
      <div>{gpu}</div>
      <div>System RAM estimation: {memory}</div>
      <div>
        Heap limit: {heap.limit ? `${heap.limit}${UNITS}` : 'unknown'}
        <br />
        Allocated: {heap.allocated ? `${heap.allocated}${UNITS}` : 'unknown'}
        <br />
        Used: {heap.used ? `${heap.used}${UNITS}` : 'unknown'}
        <br />
        Used from limit: {heap.usage ? heap.usage : 'unknown'}%
      </div>
      <div>{platform}</div>
    </div>
  )
}

export default SystemInformation
