import DoneIcon from '@material-ui/icons/CheckBoxOutlined'
import OpenIcon from '@material-ui/icons/CheckBoxOutlineBlankOutlined'
import PixiNode from '../../../../../engine/PixiNode'
import SearchFilter from './SearchFilter'

const OPTIONS = {
  open: 'open',
  done: 'done',
}

class TodoFilter extends SearchFilter {
  base = 'todo'

  options = [OPTIONS.open, OPTIONS.done]

  initOptions = undefined

  filter(term: string, node: PixiNode): boolean {
    if (node.checked === undefined) return false
    return term === OPTIONS.done ? node.checked : !node.checked
  }

  getChipProps(term: string) {
    return {
      label: term,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getChipReactProps(term: string) {
    return {
      avatar: term === OPTIONS.done ? DoneIcon : OpenIcon,
    }
  }
}

export default TodoFilter
