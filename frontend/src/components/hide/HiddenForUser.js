import useAuth from '../../hooks/useAuth'

const HiddenForUser = ({children}) => {
  const {isLoggedIn} = useAuth()
  return isLoggedIn ? null : children
}

export default HiddenForUser
