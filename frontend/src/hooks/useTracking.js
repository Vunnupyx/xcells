import {useContext} from 'react'

import {TrackingContext} from '../contexts/tracking'

export const useTracking = () => useContext(TrackingContext)
