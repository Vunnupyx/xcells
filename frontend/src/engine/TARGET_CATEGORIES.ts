/**
 * these are used to identify to which kind of element an event target belongs
 */

export type TargetCategoryNode = 'node'
export type TargetCategoryEdge = 'edge'
export type TargetCategoryGhost = 'ghost'
export type TargetCategories = TargetCategoryNode | TargetCategoryEdge | TargetCategoryGhost

const TARGET_CATEGORIES: {
  node: TargetCategoryNode
  edge: TargetCategoryEdge
  ghost: TargetCategoryGhost
} = {
  node: 'node',
  edge: 'edge',
  ghost: 'ghost',
}

export default TARGET_CATEGORIES
