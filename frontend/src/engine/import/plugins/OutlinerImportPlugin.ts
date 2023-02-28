import {IImportPlugin} from '../types'
import {generateNodeId} from '../../../shared/utils/generateId'
import {MapData} from '../../types'

const linesToNodes = (groupedLines: string[]): MapData => {
  let lastNode: string
  const parentInLevel: string[] = []
  const spacesInLevel: number[] = []

  return groupedLines.reduce((result, line) => {
    let currentSpaces = 0
    for (let i = 0; i < line.length; i += 1) {
      if (line[i] === ' ') {
        currentSpaces += 1
      } else {
        break
      }
    }
    const title = line.slice(currentSpaces)
    const id = generateNodeId()

    if (!lastNode) {
      result.root = id
      result.nodes = {
        [id]: {
          id,
          title,
          children: [],
        },
      }
      spacesInLevel.push(currentSpaces)
      parentInLevel.push(id)
    } else {
      const spacesInCurrentLevel = spacesInLevel.reduce((acc, v) => acc + v, 0)
      if (currentSpaces === spacesInCurrentLevel) {
        // same level as before, nothing to be done
      } else if (currentSpaces > spacesInCurrentLevel) {
        // new sublevel
        parentInLevel.push(result.nodes[lastNode].id)
        spacesInLevel.push(currentSpaces - spacesInCurrentLevel)
      } else if (currentSpaces < spacesInCurrentLevel) {
        // back to a previous parent, maybe we jump several lines back
        for (let i = 0; i < spacesInLevel.length; i += 1) {
          spacesInLevel.pop()
          parentInLevel.pop()
          if (currentSpaces >= spacesInLevel.reduce((acc, v) => acc + v, 0)) {
            break
          }
        }
      }
      const parent = parentInLevel[parentInLevel.length - 1]

      if (!parent) {
        // this should not happen
        throw new Error('Could not determine last parent')
      }

      result.nodes[id] = {
        id,
        title,
        parent,
        children: [],
      }
      result.nodes[parent].children?.push(id)
    }
    lastNode = id

    return result
  }, {} as MapData)
}

export default class OutlinerImportPlugin extends IImportPlugin {
  readonly fileExtensions = ['txt']

  readonly mimeTypes = ['text/plain']

  transform = async (data: Blob): Promise<MapData[]> => {
    // @TODO: how does multiline text work?

    const text = await data.text()

    const lines = text.split('\n')

    return lines
      .map(s => s.replaceAll('\r', '').replaceAll('\t', '    '))
      .filter(s => !/^[\s]*$/.test(s))
      .reduce<string[][]>((groups, line) => {
        if (!line.startsWith(' ')) {
          groups.push([])
        }

        groups[groups.length - 1].push(line)

        return groups
      }, [])
      .map(linesToNodes)
  }
}
