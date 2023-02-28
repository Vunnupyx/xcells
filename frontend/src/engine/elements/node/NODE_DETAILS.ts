import CONFIG from '../../CONFIG'
import NODE_DETAIL_LEVELS from './NODE_DETAIL_LEVELS'

export enum BORDER_DETAILS {
  rounded,
  squared,
  none,
}

export type NodeDetail = {
  fontSizeFactor: number
  renderText: boolean
  showChildren: boolean
  roundCorners: boolean
  borderType: BORDER_DETAILS
  showImage: boolean
}

const NODE_DETAILS: Record<NODE_DETAIL_LEVELS, NodeDetail> = {
  [NODE_DETAIL_LEVELS.huge]: {
    fontSizeFactor: CONFIG.nodes.text.sizeFactors[NODE_DETAIL_LEVELS.huge],
    renderText: true,
    showChildren: true,
    roundCorners: true,
    borderType: BORDER_DETAILS.rounded,
    showImage: true,
  },
  [NODE_DETAIL_LEVELS.large]: {
    fontSizeFactor: CONFIG.nodes.text.sizeFactors[NODE_DETAIL_LEVELS.large],
    renderText: true,
    showChildren: true,
    roundCorners: true,
    borderType: BORDER_DETAILS.rounded,
    showImage: true,
  },
  [NODE_DETAIL_LEVELS.normal]: {
    fontSizeFactor: CONFIG.nodes.text.sizeFactors[NODE_DETAIL_LEVELS.normal],
    renderText: true,
    showChildren: true,
    roundCorners: true,
    borderType: BORDER_DETAILS.rounded,
    showImage: true,
  },
  [NODE_DETAIL_LEVELS.small]: {
    fontSizeFactor: CONFIG.nodes.text.sizeFactors[NODE_DETAIL_LEVELS.small],
    renderText: true,
    showChildren: true,
    roundCorners: false,
    borderType: BORDER_DETAILS.squared,
    showImage: true,
  },
  [NODE_DETAIL_LEVELS.minimal]: {
    fontSizeFactor: CONFIG.nodes.text.sizeFactors[NODE_DETAIL_LEVELS.minimal],
    renderText: false,
    showChildren: false,
    roundCorners: false,
    borderType: BORDER_DETAILS.none,
    showImage: false,
  },
}

export default NODE_DETAILS
