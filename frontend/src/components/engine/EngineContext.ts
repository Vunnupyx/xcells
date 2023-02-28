import {createContext} from 'react'
import type PixiRenderEngine from '../../engine/PixiRenderEngine'

const EngineContext = createContext({} as PixiRenderEngine)

export default EngineContext
