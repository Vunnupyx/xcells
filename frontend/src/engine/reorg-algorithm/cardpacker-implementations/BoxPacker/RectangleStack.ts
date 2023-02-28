import RefRectangle from './RefRectangle'

export default class RectangleStack<T> {
  private baseDim: number

  protected stackDims: number[]

  protected order: T[]

  private maxStackDim?: number

  private curStackDim: number

  constructor(maxStackDim?: number) {
    this.stackDims = []
    this.baseDim = 0
    this.order = []
    this.maxStackDim = maxStackDim
    this.curStackDim = 0
  }

  public canAdd(expansionInStackDim: number): boolean {
    return this.maxStackDim == null || this.curStackDim + expansionInStackDim <= this.maxStackDim
  }

  /**
   * Adds an rectangle to the stack
   * @assert canAdd(rect) was checked before
   * @param rect rectangle that is added
   */
  public add(expansionInStackDim: number, expansionInBaseDim: number, ref: T): void {
    this.stackDims.push(expansionInStackDim)
    this.curStackDim += expansionInStackDim
    this.baseDim = Math.max(this.baseDim, expansionInBaseDim)
    this.order.push(ref)
  }

  /**
   * Expands all reactangles to fill the desired dimensions.
   * @param desiredExpInStackDim > this.curStackDim
   * @param desiredExpInBaseDim > this.baseDim
   */
  public expandTo(desiredExpInStackDim: number, desiredExpInBaseDim: number): void {
    if (desiredExpInBaseDim < this.baseDim) return
    this.baseDim = desiredExpInBaseDim

    const freeSpaceInStackDim = desiredExpInStackDim - this.curStackDim
    if (freeSpaceInStackDim <= 0) return

    for (let i = 0; i < freeSpaceInStackDim; i += 1) {
      this.stackDims[i % this.stackDims.length] += 1
    }
  }

  public getRectangles(baseStart = 0, stackStart = 0): RefRectangle<T>[] {
    const rects: RefRectangle<T>[] = []
    let tempExpInStackDir = 0
    this.order.forEach((rect, i) => {
      rects.push({
        ref: rect,
        dim1expansion: this.baseDim,
        dim2expansion: this.stackDims[i],
        dim1start: baseStart,
        dim2start: stackStart + tempExpInStackDir,
      })
      tempExpInStackDir += this.stackDims[i]
    })
    return rects
  }

  get dims(): {expansionInStackDim: number; expansionInBaseDim: number} {
    return {expansionInStackDim: this.curStackDim, expansionInBaseDim: this.baseDim}
  }
}
