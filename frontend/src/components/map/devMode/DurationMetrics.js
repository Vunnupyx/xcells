import React from 'react'
import {durationMetrics} from '../../../engine/utils/logDuration'

const TABLE_STYLE = {
  width: '100%',
}

const TABLE_HEAD_STYLE = {
  fontSize: '80%',
}

const round = number => Math.round(number * 10) / 10

const DurationMetrics = () => (
  <table style={TABLE_STYLE}>
    <thead style={TABLE_HEAD_STYLE}>
      <tr>
        <th>Name</th>
        <th>Count</th>
        <th>Min</th>
        <th>Max</th>
        <th>Sum</th>
        <th>Avg</th>
      </tr>
    </thead>
    <tbody>
      {Array.from(durationMetrics.entries()).map(([name, {sum, count, max, min}]) => (
        <tr key={name}>
          <td>{name}</td>
          <td>{count}</td>
          <td>{round(min)}</td>
          <td>{round(max)}</td>
          <td>{round(sum)}</td>
          <td>{round(sum / count)}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

export default DurationMetrics
