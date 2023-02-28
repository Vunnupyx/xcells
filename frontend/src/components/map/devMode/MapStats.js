import React from 'react'
import useMapStore from '../../../hooks/useMapStore'

const getCount = obj => (obj ? Object.values(obj).length : 0)
const getPropCount = (obj, propName) =>
  Object.values(obj || {}).reduce((count, node) => (node[propName] ? count + 1 : count), 0)

const MapStats = () => {
  const {edges, nodes} = useMapStore()

  const edgeCount = getCount(edges)
  const nodeCount = getCount(nodes)
  const imageCount = getPropCount(nodes, 'image')
  const fileCount = getPropCount(nodes, 'file')
  const letterCount = Object.values(nodes || {}).reduce((sum, node) => sum + (node.title?.length || 0), 0)

  return (
    <div>
      <div>Edges: {edgeCount}</div>
      <div>Nodes: {nodeCount}</div>
      <div>Images: {imageCount}</div>
      <div>Files: {fileCount}</div>
      <div>Total Letters: {letterCount}</div>
    </div>
  )
}

export default MapStats
