import useMapStore from '../../hooks/useMapStore'

const HiddenReadOnly = ({children}) => {
  const {isWriteable} = useMapStore()
  return isWriteable ? children : null
}

export default HiddenReadOnly
