import Moment from 'react-moment'
import React from 'react'

const AgoMoment = ({cell: {value}}) => (
  <Moment ago fromNow>
    {value}
  </Moment>
)

export default AgoMoment
