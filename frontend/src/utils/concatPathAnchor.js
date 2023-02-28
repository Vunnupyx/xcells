import urlEncode from './urlEncode'

const concatPathAnchor = (path, anchor) => `${path}${anchor ? `#${urlEncode(anchor)}` : ''}`

export default concatPathAnchor
