import LocalOfferIcon from '@material-ui/icons/LocalOffer'
import PixiNode from '../../../../../engine/PixiNode'
import PixiRenderEngine from '../../../../../engine/PixiRenderEngine'
import SearchFilter from './SearchFilter'

class TagFilter extends SearchFilter {
  base = 'tag'

  options: string[] | undefined = undefined

  private tagMapIdToName: Record<string, string> = {}

  initOptions = (engine: PixiRenderEngine): void => {
    const emptyMap: Record<string, string> = {}
    this.tagMapIdToName = engine.store.tags.reduce((map, tag) => {
      map[tag.id] = tag.name
      return map
    }, emptyMap)
    this.options = Object.values(this.tagMapIdToName)
  }

  filter(term: string, node: PixiNode): boolean {
    if (!this.tagMapIdToName) return true
    return node.tags.map(id => this.tagMapIdToName[id]).some(tag => tag.includes(term))
  }

  getChipProps(term: string) {
    return {
      label: term,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getChipReactProps(term: string) {
    return {
      avatar: LocalOfferIcon,
    }
  }
}

export default TagFilter
