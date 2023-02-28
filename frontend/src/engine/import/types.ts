import {MapData} from '../types'

export abstract class IImportPlugin {
  abstract readonly mimeTypes: string[]

  abstract readonly fileExtensions: string[]

  abstract transform: (data: Blob) => Promise<MapData[]>
}
