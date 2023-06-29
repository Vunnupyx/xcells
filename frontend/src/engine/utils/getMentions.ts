export function getRegExp(prefix: string): RegExp {
  return new RegExp(`${prefix}([\\w-]+)`)
}

const getMentions = (value: string | undefined, prefix = '@'): string[] => {
  if (typeof value !== 'string') {
    return []
  }
  const regex = getRegExp(prefix)
  const mentions = value.match(regex)
  return mentions !== null ? mentions.map(e => e.trim()) : []
}

export default getMentions
