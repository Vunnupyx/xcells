import Moment from 'react-moment'
import React from 'react'

const CardAgoMoment = ({value}) => (
  <Moment ago fromNow>
    {value}
  </Moment>
)

export default CardAgoMoment
