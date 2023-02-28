export type PasteActionText = 'text'
export type PasteActionFile = 'file'
export type PasteActionType = PasteActionText | PasteActionFile

export const PASTE_ACTION_TYPES: {
  text: PasteActionText
  file: PasteActionFile
} = {
  text: 'text',
  file: 'file',
}

export type DataTransferContent = {
  files?: File[]
  types: string[]
  text?: string
}
