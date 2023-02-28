import React, {useEffect, useState} from 'react'

import Box from '@material-ui/core/Box'
import {FormattedMessage} from 'react-intl'
import useViewport from '../../engine/useViewport'

const ViewportStats = () => {
  const viewport = useViewport()
  const [bounds, setBounds] = useState(() => viewport.getVisibleBounds())

  useEffect(() => {
    const subscriber = () => {
      setBounds(viewport.getVisibleBounds())
    }
    viewport.on('moved', subscriber)
    return () => viewport.off('moved', subscriber)
  }, [viewport, setBounds])

  return (
    <Box>
      <FormattedMessage id="devMode.viewportStats.position" />: {Math.round(bounds.x)} / {Math.round(bounds.y)}
      <br />
      <FormattedMessage id="devMode.viewportStats.scale" />: {Math.round(viewport.scale.x * 10) / 10}
    </Box>
  )
}

export default ViewportStats
