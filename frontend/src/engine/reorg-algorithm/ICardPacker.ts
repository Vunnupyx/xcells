import PixiNode from '../PixiNode'

interface ICardPacker {
  place(card: PixiNode): void
  expandChildren?(card: PixiNode, width: number, height: number): PixiNode[]
  reset?(): void
}

export default ICardPacker
