import PaletteOutlinedIcon from '@material-ui/icons/PaletteOutlined'
import PixiNode from '../../../../../engine/PixiNode'
import PixiRenderEngine from '../../../../../engine/PixiRenderEngine'
import {parsedColors} from '../../../../../engine/utils/parseColor'
import SearchFilter from './SearchFilter'

class BorderColorFilter extends SearchFilter {
  base = 'border-color'

  options?: string[] | undefined = undefined

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initOptions = (engine: PixiRenderEngine): void => {
    this.options = Object.keys(parsedColors)
  }

  filter(term: string, node: PixiNode): boolean {
    return node.borderColor === `@${term}`
  }

  getChipProps(term: string) {
    return {
      label: term,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getChipReactProps(term: string) {
    return {
      avatar: PaletteOutlinedIcon,
    }
  }
}

export default BorderColorFilter
