const remove = /[^a-zA-Z0-9_+-]/g

const urlEncode = string => encodeURI(String(string).replaceAll(' ', '_').replaceAll(remove, ''))

export default urlEncode
