import React from 'react'

/** Replacement of @material-ui/core/CardHeader */
const CardHeader = ({avatar, action, title, subheader, subaction}) => {
  const flexLeft = {flex: '0 1 50px'}
  const flexMiddle = {flex: '2 2 0'}
  const flexRight = {flex: '0 0 30px', alignItems: 'flex-start'}
  const rowOuter = {maxHeight: '50px'}
  const rowInner = {maxHeight: '25px'}

  const flexWrapper = {display: 'flex', gap: '2px'}
  const overflowHard = {overflow: 'hidden'}
  const overflowText = {overflow: 'hidden', minWidth: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis'}
  const padding = {padding: '16px'}

  return (
    <div style={{...flexWrapper, height2: rowOuter, ...padding, ...overflowHard}}>
      <div style={{...rowOuter, ...flexLeft, ...overflowHard}}>{avatar}</div>
      <div style={{...rowOuter, ...flexMiddle, ...overflowHard}}>
        <div style={{...rowInner, ...overflowText}}>{title}</div>
        <div style={{...rowInner, ...overflowText}}>{subheader}</div>
      </div>
      <div style={{...rowOuter, ...flexRight, ...overflowHard}}>
        <div style={{...rowInner, ...overflowHard}}>{action}</div>
        <div style={{...rowInner, ...overflowHard}}>{subaction}</div>
      </div>
    </div>
  )
}

export default CardHeader
