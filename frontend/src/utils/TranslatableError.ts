class TranslatableError extends Error {
  id: string

  values: Record<string, unknown> | undefined

  constructor(message: string, id: string, values?: Record<string, unknown>) {
    super(message)
    this.id = id
    this.values = values
  }
}

export default TranslatableError
