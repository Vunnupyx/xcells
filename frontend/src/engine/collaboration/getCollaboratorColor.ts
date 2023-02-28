import CONFIG from '../CONFIG'

const getCollaboratorColor = (colorIndex: number): string =>
  CONFIG.collaboratorColors[colorIndex % CONFIG.collaboratorColors.length]

export default getCollaboratorColor
