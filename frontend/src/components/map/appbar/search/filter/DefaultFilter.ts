import PixiNode from '../../../../../engine/PixiNode'
import PixiRenderEngine from '../../../../../engine/PixiRenderEngine'
import SearchFilter from './SearchFilter'
import TagFilter from './TagFilter'
import TitleFilter from './TitleFilter'

class TitleOrTagFilter extends SearchFilter {
  base = '*'

  options = undefined

  private titleFilter: TitleFilter

  private tagFilter: TagFilter

  constructor() {
    super()
    this.titleFilter = new TitleFilter()
    this.tagFilter = new TagFilter()
  }

  initOptions = (engine: PixiRenderEngine) => {
    this.tagFilter.initOptions(engine)
  }

  filter(term: string, node: PixiNode): boolean {
    return this.titleFilter.filter(term, node) || this.tagFilter.filter(term, node)
  }

  getChipProps(term: string) {
    return {
      label: term,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getChipReactProps(term: string) {
    return {}
  }
}

export default TitleOrTagFilter
