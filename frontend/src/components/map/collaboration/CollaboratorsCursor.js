import React, {useEffect, useState} from 'react'
import makeStyles from '@material-ui/styles/makeStyles'
import Button from '@material-ui/core/Button'
import NavigationIcon from '@material-ui/icons/Navigation'
import getCollaboratorColor from '../../../engine/collaboration/getCollaboratorColor'
import useEngine from '../../engine/useEngine'

const X_SHIFT = -4
const Y_SHIFT = -4

const useStyles = makeStyles(theme => ({
  cursor: {
    transform: 'rotate(-35deg)',
    marginBottom: theme.spacing(2),
  },
}))

const CollaboratorsCursor = ({collaborationCursor}) => {
  const classes = useStyles()
  const {toScreenPosition, viewport} = useEngine(false)
  const [position, setPosition] = useState(() => toScreenPosition(collaborationCursor.position))

  useEffect(() => {
    const subscribe = () => {
      setPosition(toScreenPosition(collaborationCursor.position))
    }

    collaborationCursor.on('position-change', subscribe)
    viewport.on('moved', subscribe)
    return () => {
      collaborationCursor.off('position-change', subscribe)
      viewport.off('moved', subscribe)
    }
  }, [setPosition, collaborationCursor, viewport, toScreenPosition])

  return (
    <div
      style={{
        color: getCollaboratorColor(collaborationCursor.collaborator.colorIndex),
        pointerEvents: 'none',
        position: 'absolute',
        left: position.x + X_SHIFT,
        top: position.y + Y_SHIFT,
      }}
    >
      <NavigationIcon className={classes.cursor} />
      <Button
        style={{
          backgroundColor: getCollaboratorColor(collaborationCursor.collaborator.colorIndex),
          color: 'white',
          boxShadow: '5px 5px 20px silver',
        }}
        size="small"
        variant="contained"
      >
        <nobr>{collaborationCursor.collaborator.displayName}</nobr>
      </Button>
    </div>
  )
}

export default CollaboratorsCursor
