import {useContext} from 'react'
import type {Viewport} from 'pixi-viewport'
import EngineContext from './EngineContext'

const useViewport = (): Viewport => useContext(EngineContext).viewport

export default useViewport
