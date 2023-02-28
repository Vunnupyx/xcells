import React, {useCallback} from 'react'

import TextField from '@material-ui/core/TextField'

import useMapStore from '../../../hooks/useMapStore'
import {edit} from '../../../store/actions'

const MapTitle = () => {
  const {root, title, dispatch} = useMapStore()

  const onTitleSave = useCallback(
    event => {
      const newTitle = event.target.value

      if (newTitle === title) return

      dispatch(edit({id: root, title: newTitle}))
    },
    [root, dispatch, title],
  )

  const onEnter = useCallback(event => {
    if (event.key === 'Enter') event.target.blur()
  }, [])

  if (title === undefined) return null

  return <TextField key="title" onBlur={onTitleSave} defaultValue={title} onKeyPress={onEnter} />
}

export default MapTitle
