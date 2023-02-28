import React, {useState} from 'react'
import Tooltip from '@material-ui/core/Tooltip'
import {FormattedMessage} from 'react-intl'

/** Helper function to wrap button with tooltip and use some known settings */
export const TooltipWrapper = ({translationId, children}) => {
  const [open, setOpen] = useState(false)

  return (
    <Tooltip
      open={open}
      onMouseUp={() => setOpen(false)} // Do not draw tooltip on top of menu
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      arrow
      title={<FormattedMessage id={translationId} />}
    >
      {children}
    </Tooltip>
  )
}
