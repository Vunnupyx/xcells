import React from 'react'
import SvgIcon from '@material-ui/core/SvgIcon'
import range from '../shared/utils/range'

const Transparent = ({innerCircleRadius, rowCount = 4, ...props}) => (
  <SvgIcon {...props}>
    <svg width="24" height="24" viewBox="0 0 24 24">
      <defs>
        <clipPath id="clip-path">
          <circle fill="none" cx="12" cy="12" r="12" />
        </clipPath>
      </defs>
      <g clipPath="url(#clip-path)">
        {range(rowCount).map(col =>
          range(rowCount)
            .filter(row => (row % 2 === 0 && col % 2 === 1) || (row % 2 === 1 && col % 2 === 0))
            .map(row => (
              <rect
                key={`${col}-${row}`}
                fill="#adb4bc"
                x={(24 / rowCount) * row}
                y={(24 / rowCount) * col}
                width={24 / rowCount}
                height={24 / rowCount}
              />
            )),
        )}
        {innerCircleRadius ? <circle fill="white" cx="12" cy="12" r={innerCircleRadius} /> : null}
      </g>
    </svg>
  </SvgIcon>
)

export default Transparent
