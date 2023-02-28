import {useContext} from 'react'

import {ExperimentalFeaturesContext} from '../contexts/experimentalFeatures'

export const useExperimentalFeaturesContext = () => useContext(ExperimentalFeaturesContext)
