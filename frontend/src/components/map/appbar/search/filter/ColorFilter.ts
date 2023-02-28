import PaletteIcon from '@material-ui/icons/Palette'
import PixiNode from '../../../../../engine/PixiNode'
import PixiRenderEngine from '../../../../../engine/PixiRenderEngine'
import {parsedColors} from '../../../../../engine/utils/parseColor'
import SearchFilter from './SearchFilter'

class ColorFilter extends SearchFilter {
  base = 'color'

  options?: string[] | undefined = undefined

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initOptions = (engine: PixiRenderEngine): void => {
    this.options = Object.keys(parsedColors)
  }

  filter(term: string, node: PixiNode): boolean {
    return (node.color || node.getColorName()) === `@${term}`
  }

  getChipProps(term: string) {
    return {
      label: term,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getChipReactProps(term: string) {
    return {
      avatar: PaletteIcon,
    }
  }
}

export default ColorFilter
