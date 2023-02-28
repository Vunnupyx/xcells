import TitleIcon from '@material-ui/icons/Title'
import PixiNode from '../../../../../engine/PixiNode'
import SearchFilter from './SearchFilter'

class TitleFilter extends SearchFilter {
  base = 'title'

  options = undefined

  initOptions = undefined

  filter(term: string, node: PixiNode): boolean {
    const words = term ? term.split(' ') : []
    return words.every(w => node.title?.toLocaleLowerCase().includes(w.toLocaleLowerCase()))
  }

  getChipProps(term: string) {
    return {
      label: term,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getChipReactProps(term: string) {
    return {
      avatar: TitleIcon,
    }
  }
}

export default TitleFilter
