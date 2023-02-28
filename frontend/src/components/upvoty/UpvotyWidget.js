import React, {useEffect} from 'react'
import PropTypes from 'prop-types'
import upvoty from '../../utils/upvoty'

const publicKey = '64f20d949110247678902370ad620ea1'

const UpvotyWidget = ({boardHash, ssoToken, baseUrl, id, name}) => {
  useEffect(() => {
    upvoty.init({boardHash, user: {id, name}, ssoToken, baseUrl, publicKey})
    return () => {
      upvoty.destroy()
    }
  }, [boardHash, ssoToken, baseUrl, id, name])
  return <div data-upvoty="" />
}

UpvotyWidget.defaultProps = {
  ssoToken: null,
  boardHash: null,
  id: null,
  name: null,
}

UpvotyWidget.propTypes = {
  boardHash: PropTypes.string,
  ssoToken: PropTypes.string,
  baseUrl: PropTypes.string.isRequired,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
}

export default UpvotyWidget
