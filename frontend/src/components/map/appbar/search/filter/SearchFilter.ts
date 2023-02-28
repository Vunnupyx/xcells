import PixiNode from '../../../../../engine/PixiNode'
import PixiRenderEngine from '../../../../../engine/PixiRenderEngine'

abstract class SearchFilter {
  abstract base: string

  /**
   * either contains all static options or is undefined if
   * the initOptions-method should be called
   */
  abstract options?: string[]

  /**
   * loads all options for this filter. If this method and options
   * are both undefined, the filter allows custom input
   */
  abstract initOptions?: (engine: PixiRenderEngine) => void

  init(engine: PixiRenderEngine): void {
    if (this.options || !this.initOptions) return
    this.initOptions(engine)
  }

  abstract filter(term: string, node: PixiNode): boolean

  getChipProps(term: string) {
    return {
      label: term,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getChipReactProps(term: string) {
    return {}
  }

  static readonly SEPARATOR = ':'

  getFullOptions = () => {
    if (!this.options) return []
    return this.options.map(sub => this.baseWithColon + sub)
  }

  get baseWithColon() {
    return this.base + SearchFilter.SEPARATOR
  }

  get isOptionFilter() {
    return this.options || this.initOptions
  }
}

export default SearchFilter
