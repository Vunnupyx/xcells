import {useContext} from 'react'

import {DevModeContext} from '../contexts/devMode'

export const useDevModeContext = () => useContext(DevModeContext)
