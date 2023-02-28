import FileIcon from '@material-ui/icons/InsertDriveFileOutlined'
import PixiNode from '../../../../../engine/PixiNode'
import SearchFilter from './SearchFilter'

const OPTIONS = {
  true: 'file',
  false: 'no file',
}

class FileFilter extends SearchFilter {
  base = 'file'

  options = [OPTIONS.true, OPTIONS.false]

  initOptions = undefined

  filter(term: string, node: PixiNode): boolean {
    return (term === OPTIONS.true) === (node.file !== undefined)
  }

  getChipProps(term: string) {
    return {
      label: term,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getChipReactProps(term: string) {
    return {
      avatar: FileIcon,
    }
  }
}

export default FileFilter
