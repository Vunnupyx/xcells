import ImageIcon from '@material-ui/icons/ImageOutlined'
import PixiNode from '../../../../../engine/PixiNode'
import SearchFilter from './SearchFilter'

const OPTIONS = {
  true: 'image',
  false: 'no image',
}

class TodoFilter extends SearchFilter {
  base = 'image'

  options = [OPTIONS.true, OPTIONS.false]

  initOptions = undefined

  filter(term: string, node: PixiNode): boolean {
    return (term === OPTIONS.true) === (node.image !== undefined)
  }

  getChipProps(term: string) {
    return {
      label: term,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getChipReactProps(term: string) {
    return {
      avatar: ImageIcon,
    }
  }
}

export default TodoFilter
