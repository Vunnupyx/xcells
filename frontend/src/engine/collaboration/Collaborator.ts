class Collaborator {
  readonly id: string

  colorIndex: number

  userName: string

  nameExtension = 1

  constructor(id: string, colorIndex: number, userName: string) {
    this.id = id
    this.colorIndex = colorIndex
    this.userName = userName
  }

  get displayName(): string {
    const {userName, nameExtension} = this

    if (nameExtension !== 1) return `${userName} #${nameExtension}`
    return userName
  }
}

export default Collaborator
