import React, {useCallback, useRef} from 'react'
import useInteractionManager from '../../engine/useInteractionManager'
import NodeMenu from './NodeMenu'

const NodeContextMenu = () => {
  const manager = useInteractionManager()
  const containerRef = useRef()

  const onClose = useCallback(() => {
    manager.closeContextMenu()
  }, [manager])

  const {contextMenuPosition} = manager

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: contextMenuPosition?.x,
        top: contextMenuPosition?.y,
      }}
    >
      {contextMenuPosition ? <NodeMenu open onClose={onClose} anchorEl={containerRef.current} /> : null}
    </div>
  )
}

export default NodeContextMenu
