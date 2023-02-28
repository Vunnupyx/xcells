import TARGET_CATEGORIES from '../../../TARGET_CATEGORIES'
import {RenderEngineEvent} from '../../../types'
import NodeChildGhost from '../../../elements/node/NodeChildGhost'
import CONFIG from '../../../CONFIG'
import PointerActionHover from '../PointerActionHover'

class GhostHighlight extends PointerActionHover {
  isChanging = false

  category = TARGET_CATEGORIES.ghost

  highlight(ghost: NodeChildGhost): void {
    ghost.alpha = 1
  }

  unhighlight(ghost: NodeChildGhost): void {
    const {alpha, alphaFirst} = CONFIG.nodes.ghost
    ghost.alpha = ghost.firstGhost ? alphaFirst : alpha
  }

  move = (event: RenderEngineEvent): void => {
    const {highlightedGhost} = this.state || {}
    const ghost = event.target as unknown as NodeChildGhost

    if (highlightedGhost && ghost !== highlightedGhost) {
      this.unhighlight(highlightedGhost as NodeChildGhost)
      this.state = null
    }

    if (ghost && ghost !== highlightedGhost) {
      this.highlight(ghost)
      this.state = {highlightedGhost: ghost}
    }
  }

  reset = (): void => {
    const {unhighlight} = this
    const {highlightedGhost} = this.state || {}

    if (highlightedGhost) {
      unhighlight(highlightedGhost as NodeChildGhost)
      this.state = null
    }
  }
}

export {GhostHighlight}
