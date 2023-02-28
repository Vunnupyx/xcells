import useAuth from '../../hooks/useAuth'

const HiddenForGuest = ({children}) => {
  const {isLoggedIn} = useAuth()
  return isLoggedIn ? children : null
}

export default HiddenForGuest
