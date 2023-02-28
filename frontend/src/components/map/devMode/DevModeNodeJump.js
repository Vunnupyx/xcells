import React, {useEffect, useState} from 'react'
import {FormattedMessage} from 'react-intl'
import {useParams} from 'react-router-dom'
import useInteractionManager from '../../engine/useInteractionManager'

const save = (nodeId, storageKey) => {
  if (nodeId && nodeId !== '') {
    localStorage.setItem(storageKey, String(nodeId))
  } else {
    localStorage.removeItem(storageKey)
  }
}

const getSelected = (interactionManager, setJumpNode) => {
  const {lastSelectedNode} = interactionManager

  if (!lastSelectedNode) {
    setJumpNode('')
  } else {
    setJumpNode(lastSelectedNode.id)
  }
}

export const NodeJumpOptions = ({jumpNode, setJumpNode, storagePrefix}) => {
  const {mapId} = useParams()
  const interactionManager = useInteractionManager(false)
  const storageKey = `${storagePrefix}_${mapId}`

  useEffect(() => {
    if (jumpNode && jumpNode !== '') return
    const stored = localStorage.getItem(storageKey) || ''
    setJumpNode(stored)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setJumpNode, storageKey])

  return (
    <div>
      <div>
        <FormattedMessage id="devModeBenchmarkNodeId" />
        &#58;
      </div>
      <b />
      <input type="text" value={jumpNode} onInput={e => setJumpNode(e.target.value)} />
      <button type="button" onClick={() => getSelected(interactionManager, setJumpNode)}>
        <FormattedMessage id="devModeBenchmarkGetSelected" />
      </button>
      <button type="button" onClick={() => save(jumpNode, storageKey)}>
        <FormattedMessage id="save" />
      </button>
      <p />
    </div>
  )
}

const NodeJump = () => {
  const interactionManager = useInteractionManager(false)
  const [zoomNode, setZoomNode] = useState('')
  const storagePrefix = 'devmode_nodejump'

  return (
    <div>
      <p>
        <FormattedMessage id="devModeBenchmarkZoomToNode" />
      </p>
      <NodeJumpOptions jumpNode={zoomNode} setJumpNode={setZoomNode} storagePrefix={storagePrefix} />
      <button type="button" onClick={() => interactionManager.zoomToNode(zoomNode)}>
        <FormattedMessage id="devModeBenchmarkZoomTo" />
      </button>
      <p />
    </div>
  )
}

export default NodeJump
