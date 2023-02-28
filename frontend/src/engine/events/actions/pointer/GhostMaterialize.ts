import debug from 'debug'

import PointerActionClick from '../PointerActionClick'
import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {RenderEngineEvent, RenderNodeCandidate} from '../../../types'
import {generateNodeId} from '../../../../shared/utils/generateId'
import {add} from '../../../../store/actions'
import {isZero} from '../../../utils/arithmetics'
import PixiNode from '../../../PixiNode'

const log = debug('app:Event:GhostMaterialize')
const logError = log.extend('ERROR*', '::')

class GhostMaterialize extends PointerActionClick {
  isChanging = true

  category = TARGET_CATEGORIES.ghost

  cursor = 'pointer'

  down = (event: RenderEngineEvent): void => {
    const {candidate, node: nodeAboveGhost} = event.target || {}

    if (!candidate) return

    this.addNodeIfTemporary(nodeAboveGhost)

    log('down', candidate)

    this.state = {candidate}
  }

  up = (event: RenderEngineEvent): void => {
    const {manager} = this
    const {candidate: candidateTarget, node: nodeAboveGhost} = event.target || {}
    const {candidate: candidateDown} = this.state || {}

    if (!candidateTarget || !this.sameCandidate(candidateDown as RenderNodeCandidate | undefined, candidateTarget))
      return

    log('up', candidateTarget)

    const id = generateNodeId()

    const materializeNode = async () => {
      try {
        await manager.createNode({
          ...candidateTarget,
          color: nodeAboveGhost?.color,
          borderColor: nodeAboveGhost?.borderColor,
          id,
        })
        await manager.selectSingleNode(id)
        await manager.nodeEdit(id, '', 'end')
      } catch (e) {
        logError(`Could not materialize ghost: ${(e as Error).message}`)
      }
    }
    materializeNode().then()
  }

  sameCandidate = (cand1: RenderNodeCandidate | undefined, cand2: RenderNodeCandidate | undefined): boolean => {
    if (!cand1 || !cand2) return false
    const same = (a: number | undefined, b: number | undefined): boolean => {
      if (!a && !b) return true
      if (!a || !b) return false
      return isZero(a - b)
    }
    return (
      same(cand1.x, cand2.x) &&
      same(cand1.y, cand2.y) &&
      same(cand1.height, cand2.height) &&
      same(cand1.width, cand2.width) &&
      cand1.parent === cand2.parent
    )
  }

  addNodeIfTemporary = (node?: PixiNode) => {
    if (!node || !node.state.isTemporary) return
    const {manager} = this
    node.state.isTemporary = false
    manager.addDispatch(add(node))
  }
}

export {GhostMaterialize}
