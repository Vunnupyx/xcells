import en from './map.en'

const flattenEntries = ([groupNameOrName, stringOrGroup]) => {
  if (typeof stringOrGroup === 'object' && !('defaultMessage' in stringOrGroup)) {
    const groupName = groupNameOrName
    return Object.entries(stringOrGroup)
      .map(([name, translation]) => [`${groupName}.${name}`, translation])
      .flatMap(flattenEntries)
  }
  return [[groupNameOrName, stringOrGroup]]
}

const flatten = obj => Object.fromEntries(Object.entries(obj).flatMap(flattenEntries))

const all = {
  en: flatten(en),
}

export default all
