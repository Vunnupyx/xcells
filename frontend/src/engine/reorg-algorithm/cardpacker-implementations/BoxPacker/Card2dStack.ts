import PixiNode from '../../../PixiNode'
import RectangleStack from './RectangleStack'
import RefRectangle from './RefRectangle'

export default class Card2dStack extends RectangleStack<RectangleStack<PixiNode>> {
  private maxHeight: number

  private currentRectStack: RectangleStack<PixiNode>

  private cards: PixiNode[]

  constructor(maxHeight: number, cardRects: RefRectangle<PixiNode>[]) {
    super(Infinity)
    this.maxHeight = maxHeight
    this.currentRectStack = new RectangleStack<PixiNode>(this.maxHeight)
    this.cards = cardRects.map(rect => rect.ref)

    cardRects.forEach(rect => {
      this.addRect(rect)
    })
    this.storeCurrentStack()
  }

  private addRect(rect: RefRectangle<PixiNode>): void {
    if (!this.currentRectStack.canAdd(rect.dim2expansion)) {
      this.storeCurrentStack()
    }
    this.currentRectStack.add(rect.dim2expansion, rect.dim1expansion, rect.ref)
  }

  private storeCurrentStack(): void {
    const {expansionInBaseDim: stackWidth, expansionInStackDim: stackHeight} = this.currentRectStack.dims
    this.add(stackWidth, stackHeight, this.currentRectStack)
    this.currentRectStack = new RectangleStack<PixiNode>(this.maxHeight)
  }

  public expandTo(width: number, height: number): void {
    super.expandTo(width, height)
    this.order.forEach((stack, i) => {
      stack.expandTo(height, this.stackDims[i])
    })
  }

  public getCardRectangles(): RefRectangle<PixiNode>[] {
    const rects: RefRectangle<PixiNode>[] = []
    const stackRects = this.getRectangles(0, 0)
    stackRects.forEach(sRect => {
      rects.push(...sRect.ref.getRectangles(sRect.dim2start))
    })
    return rects
  }

  get cardOrder(): PixiNode[] {
    return this.cards
  }
}
