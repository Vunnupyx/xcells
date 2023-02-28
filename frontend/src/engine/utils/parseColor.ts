import Color from 'color'
import CONFIG from '../CONFIG'
import isDarkColor from './isDarkColor'

export type NodeColors = {
  background: Color
  activeBackground: Color
  active: Color
  highlight: Color
  border: Color
  text: Color
  textContrast: Color
  textLink: Color
}

type BaseColorName =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'violet'
  | 'salmon'
  | 'white'
  | 'black'
  | 'transparent'

type ColorName =
  | BaseColorName
  | 'red-light'
  | 'orange-light'
  | 'yellow-light'
  | 'green-light'
  | 'blue-light'
  | 'violet-light'
  | 'salmon-light'
  | 'white-light'
  | 'black-light'

type NodeColorEntries = Partial<Record<ColorName, NodeColors>>

const mixColor = (name: BaseColorName) => {
  const {full, mix} = CONFIG.colors[name]
  return (percent: number): Color => Color(full).mix(Color(mix), (100 - percent) / 100)
}

const textLight = Color(CONFIG.nodes.text.light)
const textDark = Color(CONFIG.nodes.text.dark)
const textLink = Color(CONFIG.nodes.text.link)

const generateDefaultColors = (name: BaseColorName): NodeColorEntries => ({
  [name]: {
    background: mixColor(name)(80),
    activeBackground: mixColor(name)(60),
    active: mixColor(name)(40),
    highlight: mixColor(name)(10),
    border: mixColor(name)(40),
    text: isDarkColor(mixColor(name)(80)) ? textLight : textDark,
    textContrast: isDarkColor(mixColor(name)(80)) ? textDark : textLight,
    textLink,
  },
  [`${name}-light`]: {
    background: mixColor(name)(10),
    activeBackground: mixColor(name)(20),
    active: mixColor(name)(40),
    border: mixColor(name)(40),
    highlight: mixColor(name)(80),
    text: isDarkColor(mixColor(name)(10)) ? textLight : textDark,
    textContrast: isDarkColor(mixColor(name)(10)) ? textDark : textLight,
    textLink,
  },
})

export const parsedColors: NodeColorEntries = {
  ...generateDefaultColors('red'),
  ...generateDefaultColors('orange'),
  ...generateDefaultColors('yellow'),
  ...generateDefaultColors('green'),
  ...generateDefaultColors('blue'),
  ...generateDefaultColors('violet'),
  salmon: {
    background: mixColor('salmon')(100),
    activeBackground: mixColor('salmon')(80),
    active: mixColor('salmon')(60),
    border: mixColor('salmon')(60),
    highlight: mixColor('salmon')(20),
    text: textLight,
    textContrast: textDark,
    textLink,
  },
  'salmon-light': {
    background: mixColor('salmon')(20),
    activeBackground: mixColor('salmon')(40),
    active: mixColor('salmon')(60),
    border: mixColor('salmon')(60),
    highlight: mixColor('salmon')(100),
    text: textDark,
    textContrast: textLight,
    textLink,
  },

  // ...generateDefaultColors('white'),
  white: {
    background: mixColor('white')(100),
    activeBackground: mixColor('white')(90),
    active: mixColor('white')(60),
    border: mixColor('white')(60),
    highlight: mixColor('white')(100),
    text: textDark,
    textContrast: textLight,
    textLink,
  },
  'white-light': {
    background: mixColor('white')(80),
    activeBackground: mixColor('white')(70),
    active: mixColor('white')(50),
    border: mixColor('white')(50),
    highlight: mixColor('white')(80),
    text: textDark,
    textContrast: textLight,
    textLink,
  },

  ...generateDefaultColors('black'),

  transparent: {
    background: mixColor('transparent')(100),
    activeBackground: mixColor('transparent')(80),
    active: mixColor('transparent')(60),
    border: mixColor('transparent')(60),
    highlight: mixColor('transparent')(10),
    text: textDark,
    textContrast: textDark,
    textLink,
  },
}

const colorCache: {[k: string]: NodeColors} = {}

const parseColor = (color: string): NodeColors => {
  if (color.startsWith('@')) {
    const colorName = color.slice(1) as ColorName
    return (parsedColors[colorName] || parsedColors.white) as NodeColors
  }

  if (!(color in colorCache)) {
    const newColor = Color(color)
    const isDark = isDarkColor(newColor)
    const mix = Color(newColor.lightness() > 90 ? CONFIG.colors.white.mix : CONFIG.colors.black.mix)
    const background = newColor.mix(mix, 0.2)
    const activeBackground = newColor.mix(mix, 0.4)
    const active = newColor.mix(mix, 0.6)
    const highlight = newColor.mix(mix, 0.9)

    colorCache[color] = {
      background,
      activeBackground,
      active,
      border: active,
      highlight,
      text: isDark ? textLight : textDark,
      textContrast: !isDark ? textDark : textLight,
      textLink,
    }
  }

  return colorCache[color]
}

export default parseColor
