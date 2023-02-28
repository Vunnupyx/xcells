class BoundedArray<T> extends Array<T> {
  constructor(private maxValues = 100) {
    super()
  }

  public push(...args: T[]): number {
    super.push(...args)

    while (this.length > this.maxValues) {
      super.shift()
    }
    return this.length
  }
}

export default BoundedArray
