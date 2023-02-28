import Color from 'color'
import CONFIG from '../CONFIG'

const isDarkColor = (color: Color): boolean => color.darken(CONFIG.text.fontIsDarkCorrection).isDark()

export default isDarkColor
