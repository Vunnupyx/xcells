import {createContext} from 'react'
import useApi from '../hooks/useApi'

/** Dependency injection for useApi */
export const ApiContext = createContext(useApi())
