import CONFIG from '../../CONFIG'
import EDGE_DETAIL_LEVELS from './EDGE_DETAIL_LEVELS'

export type EdgeDetail = {
  fontSizeFactor: number
  renderText: boolean
}

export const EDGE_DETAILS: Record<EDGE_DETAIL_LEVELS, EdgeDetail> = {
  [EDGE_DETAIL_LEVELS.huge]: {
    fontSizeFactor: CONFIG.edges.text.sizeFactors[EDGE_DETAIL_LEVELS.huge],
    renderText: true,
  },
  [EDGE_DETAIL_LEVELS.large]: {
    fontSizeFactor: CONFIG.edges.text.sizeFactors[EDGE_DETAIL_LEVELS.large],
    renderText: true,
  },
  [EDGE_DETAIL_LEVELS.normal]: {
    fontSizeFactor: CONFIG.edges.text.sizeFactors[EDGE_DETAIL_LEVELS.normal],
    renderText: true,
  },
  [EDGE_DETAIL_LEVELS.small]: {
    fontSizeFactor: CONFIG.edges.text.sizeFactors[EDGE_DETAIL_LEVELS.small],
    renderText: true,
  },
  [EDGE_DETAIL_LEVELS.minimal]: {
    fontSizeFactor: CONFIG.edges.text.sizeFactors[EDGE_DETAIL_LEVELS.minimal],
    renderText: false,
  },
}

export default EDGE_DETAILS
