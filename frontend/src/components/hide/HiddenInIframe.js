import checkInIframe from '../../utils/checkInIframe'

const isInIframe = checkInIframe()

const HiddenInIframe = ({children}) => (isInIframe ? null : children)

export default HiddenInIframe
