import React from 'react'
import Box from '@material-ui/core/Box'
import UpvotyWidget from '../upvoty/UpvotyWidget'
import useAuth from '../../hooks/useAuth'

const Feedback = () => {
  const {auth} = useAuth()

  if (auth.userId) {
    return (
      <Box marginTop={-2}>
        <UpvotyWidget
          baseUrl="feedback.infinitymaps.io"
          boardHash="feedback-bugs-und-wuensche"
          id={auth.userId}
          name={auth.name}
        />
      </Box>
    )
  }

  return (
    <Box marginTop={-2} height="calc(100% - 100px)">
      <UpvotyWidget baseUrl="feedback.infinitymaps.io" boardHash="feedback-bugs-und-wuensche" />
    </Box>
  )
}

export default Feedback
