import React from 'react'

import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import makeStyles from '@material-ui/styles/makeStyles'

import {FormattedMessage} from 'react-intl'

import CONFIG from '../../../engine/CONFIG'

const useStyle = makeStyles(() => ({
  root: {
    padding: 5,
  },
}))

const TooltipButton = ({titleId, icon, placement = 'right', ...props}) => {
  const classes = useStyle()
  const title = <FormattedMessage id={titleId} />
  if (!titleId) {
    return <IconButton classes={classes} {...props} />
  }
  return (
    <Tooltip placement={placement} arrow enterDelay={CONFIG.toolbar.tooltipDelay} title={title}>
      {/* span is needed to show the tooltip, if the button is disabled, as button would not receive events */}
      <span>
        <IconButton classes={classes} {...props}>
          {icon} {props.children}
        </IconButton>
      </span>
    </Tooltip>
  )
}

export default TooltipButton
