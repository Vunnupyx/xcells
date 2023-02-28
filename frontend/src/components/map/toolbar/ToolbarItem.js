import React from 'react'
import Tooltip from '@material-ui/core/Tooltip'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import CONFIG from '../../../engine/CONFIG'

const ToolbarItem = ({children, onClick, title, ...props}) => {
  const button = (
    <Button onClick={onClick} className="class-test-mw" {...props}>
      {children}
    </Button>
  )
  return title ? (
    <Grid item xs="auto">
      <Tooltip placement="bottom" arrow enterDelay={CONFIG.toolbar.tooltipDelay} title={title}>
        <span>{button}</span>
      </Tooltip>
    </Grid>
  ) : (
    <Grid item xs="auto">
      {button}
    </Grid>
  )
}

export default ToolbarItem
