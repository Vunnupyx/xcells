const colorCache = {}
const colors = {
  white: '#fff',
}

const hexToDec = color =>
  String(color).length === 4
    ? [1, 2, 3].map(i => parseInt(color.substring(i, i + 1).repeat(2), 16))
    : [1, 3, 5].map(i => parseInt(color.substring(i, i + 2), 16))

const cleanColor = color => (String(color) in colors ? colors[String(color)] : color)

export const colorOpacity = (base, cover, opacity) => {
  const key = `${base}-${cover}-${opacity}`

  if (!(key in colorCache)) {
    base = hexToDec(cleanColor(base))
    cover = hexToDec(cleanColor(cover))

    colorCache[key] = base
      .map((b, i) => (1 - opacity) * b + opacity * cover[i])
      .reduce((acc, c) => acc + Math.round(c).toString(16), '#')
  }

  return colorCache[key]
}
