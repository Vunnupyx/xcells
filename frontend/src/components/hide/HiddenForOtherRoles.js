import PropTypes from 'prop-types'
import useAuth from '../../hooks/useAuth'

const HiddenForOtherRoles = ({roles: rolesToShow, children}) => {
  const authContext = useAuth()

  if (!authContext || !authContext.auth) {
    return null
  }
  const {roles} = authContext.auth

  if (!roles || !rolesToShow.every(role => roles.includes(role))) {
    return null
  }

  return children
}

HiddenForOtherRoles.propTypes = {
  roles: PropTypes.array.isRequired,
}

export default HiddenForOtherRoles
