import {PDFContext, PDFDict, PDFDocument, PDFObject, PDFString} from 'pdf-lib/cjs/index'
import {applyTemplate} from '../../../../store/utils'
import {MapContentData, NodeId} from '../../../types'
import {PdfOutlineTemplate, OutlineEntry} from './PdfOutlineTemplate'
import {generateNodeId} from '../../../../shared/utils/generateId'
import PixiNode from '../../../PixiNode'

import translations from '../../../../intl/map.en'

type PdfMetaData = {
  author?: string
  subject?: string
  keywords?: string
  creationDate?: Date
}

const getFindFunc =
  (context: PDFContext) =>
  (dict: PDFObject | undefined, name: string): PDFObject | undefined => {
    if (!dict) return undefined
    const results = (dict as PDFDict).entries().filter(entry => entry[0].asString() === name)
    if (results.length <= 0) return undefined
    const ref = results[0][1]
    if (!ref) return undefined
    return context.lookup(ref)
  }

class PdfTemplate {
  private file: File

  private fileId: string

  private doc: PDFDocument | undefined

  private template: MapContentData

  readonly ROOT_ID: NodeId

  readonly AUTHOR_ID: NodeId

  readonly SUBJECT_ID: NodeId

  readonly KEYWORDS_ID: NodeId

  readonly CREATION_DATE_ID: NodeId

  readonly OUTLINE_ID: NodeId

  readonly DOWNLOAD_ID: NodeId

  private constructor(file: File, fileId: string) {
    this.file = file
    this.fileId = fileId

    this.ROOT_ID = generateNodeId()
    this.DOWNLOAD_ID = generateNodeId()
    this.AUTHOR_ID = generateNodeId()
    this.SUBJECT_ID = generateNodeId()
    this.KEYWORDS_ID = generateNodeId()
    this.CREATION_DATE_ID = generateNodeId()
    this.OUTLINE_ID = generateNodeId()

    this.template = this.createBaseTemplate()
  }

  static from = async (file: File, fileId: string): Promise<MapContentData> => {
    const pdfTemplate = new PdfTemplate(file, fileId)
    await pdfTemplate.extractStructure(file)

    const metaData = pdfTemplate.getMetadata()
    pdfTemplate.setTitle(pdfTemplate.AUTHOR_ID, metaData.author, true)
    pdfTemplate.setTitle(pdfTemplate.SUBJECT_ID, metaData.subject, true)
    pdfTemplate.setTitle(pdfTemplate.KEYWORDS_ID, metaData.keywords, true)
    pdfTemplate.setTitle(pdfTemplate.CREATION_DATE_ID, metaData.creationDate?.toDateString(), true)

    const outline = pdfTemplate.getOutline()

    if (outline.subEntries.length > 0) {
      const outlineTemplate = new PdfOutlineTemplate(outline)
      applyTemplate(pdfTemplate.template, pdfTemplate.OUTLINE_ID, outlineTemplate.template)
    } else {
      pdfTemplate.setTitle(pdfTemplate.OUTLINE_ID, translations.pdfTemplateOutlineNotFound, true)
    }

    return pdfTemplate.template
  }

  extractStructure = async (file: File): Promise<void> => {
    const readFile = async (f: File): Promise<PDFDocument> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async () => {
          if (!reader.result) reject()
          const buffer = new Uint8Array(reader.result as ArrayBuffer)
          resolve(await PDFDocument.load(buffer))
        }
        reader.readAsArrayBuffer(f)
      })
    }
    this.doc = await readFile(file)
  }

  /**
   * extractStructure has to be called before
   */
  getOutline = (): OutlineEntry => {
    const result: OutlineEntry = {
      title: 'Outline',
      subEntries: [],
    }

    if (!this.doc) return result

    const {context, catalog} = this.doc
    const find = getFindFunc(context)

    // dfs-method
    const traverseOutline = (root: PDFDict, outlineEntry: OutlineEntry) => {
      let cur = find(root, '/First')
      if (!cur) return
      do {
        const heading = find(cur, '/Title')
        const subEntry: OutlineEntry = {
          title: (heading as PDFString).decodeText(),
          subEntries: [],
        }
        outlineEntry.subEntries.push(subEntry)
        traverseOutline(cur as unknown as PDFDict, subEntry)
        cur = find(cur, '/Next')
      } while (cur)
    }

    // start dfs
    const outline = find(catalog, '/Outlines')
    traverseOutline(outline as unknown as PDFDict, result)

    return result
  }

  /**
   * extractStructure has to be called before
   */
  getMetadata = (): PdfMetaData => {
    return {
      author: this.doc?.getAuthor(),
      subject: this.doc?.getSubject(),
      keywords: this.doc?.getKeywords(),
      creationDate: this.doc?.getCreationDate(),
    }
  }

  setTitle = (nodeId: NodeId, text: string | undefined, append: boolean): void => {
    const undef = '-'
    const title = this.template.nodes[nodeId].title || ''
    if (append) {
      this.template.nodes[nodeId].title = title + (text || undef)
    } else {
      this.template.nodes[nodeId].title = text || undef
    }
  }

  createBaseTemplate = () => {
    const template: MapContentData = {
      nodes: {},
      edges: {},
      root: this.ROOT_ID,
    }

    template.nodes[this.ROOT_ID] = {
      id: this.ROOT_ID,
      children: [
        this.DOWNLOAD_ID,
        this.AUTHOR_ID,
        this.SUBJECT_ID,
        this.KEYWORDS_ID,
        this.CREATION_DATE_ID,
        this.OUTLINE_ID,
      ],
      title: this.file.name,
      color: '@red',
      scale: 0.6666666666666666,
      x: 0,
      y: 0,
      width: 546,
      // height: 358.8,
      height: 249.6,
    }

    template.nodes[this.DOWNLOAD_ID] = {
      id: this.DOWNLOAD_ID,
      children: [],
      file: this.fileId,
      title: translations.pdfTemplateDownload,
      color: '@red-light',
      borderColor: '@red-light',
      scale: 0.6666666666666666,
      parent: this.ROOT_ID,
      x: 0,
      y: 0,
      width: 280.8,
      height: 312,
    }

    template.nodes[this.AUTHOR_ID] = {
      id: this.AUTHOR_ID,
      children: [],
      title: translations.pdfTemplateAuthor,
      scale: 0.6666666666666666,
      parent: this.ROOT_ID,
      x: 296.4,
      y: 0,
      width: 483.59999999999997,
      height: 31.2,
    }

    template.nodes[this.SUBJECT_ID] = {
      id: this.SUBJECT_ID,
      children: [],
      title: translations.pdfTemplateSubject,
      scale: 0.6666666666666666,
      parent: this.ROOT_ID,
      x: 296.4,
      y: 46.8,
      width: 483.59999999999997,
      height: 31.2,
    }

    template.nodes[this.KEYWORDS_ID] = {
      id: this.KEYWORDS_ID,
      children: [],
      title: translations.pdfTemplateKeywords,
      scale: 0.6666666666666666,
      parent: this.ROOT_ID,
      x: 296.4,
      y: 93.6,
      width: 483.59999999999997,
      height: 31.2,
    }

    template.nodes[this.CREATION_DATE_ID] = {
      id: this.CREATION_DATE_ID,
      children: [],
      title: translations.pdfTemplateCreationDate,
      scale: 0.6666666666666666,
      parent: this.ROOT_ID,
      x: 296.4,
      y: 140.4,
      width: 483.59999999999997,
      height: 31.2,
    }

    template.nodes[this.OUTLINE_ID] = {
      id: this.OUTLINE_ID,
      children: [],
      title: translations.pdfTemplateOutline,
      scale: 0.6666666666666666,
      parent: this.ROOT_ID,
      x: 296.4,
      y: 187.2,
      width: 483.59999999999997,
      height: 31.2,
    }

    return template
  }

  static findOutlineCard = (pdfTemplateRoot: PixiNode): PixiNode | undefined => {
    const children = [...pdfTemplateRoot.childNodes]
    const isOutlineCard = (node: PixiNode) => node.title?.includes(translations.pdfTemplateOutline)
    return children.find(isOutlineCard)
  }
}

export default PdfTemplate
