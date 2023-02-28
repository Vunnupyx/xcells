import CONFIG from '../CONFIG'

const onGrid = (x: number): number => Math.round(x / CONFIG.nodes.gridSize) * CONFIG.nodes.gridSize

export default onGrid
