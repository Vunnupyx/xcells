import {useContext} from 'react'
import EngineContext from './EngineContext'
import type RenderEngineControl from '../../engine/RenderEngineControl'

const useEngineControl = (): RenderEngineControl => useContext(EngineContext).control

export default useEngineControl
