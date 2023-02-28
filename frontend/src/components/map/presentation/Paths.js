import React, {useCallback, useMemo, useState} from 'react'
import useMapStore from '../../../hooks/useMapStore'
import PresentingController from './PresentingController'
import PathsDrawer from './PathsDrawer'
import useInteractionManager from '../../engine/useInteractionManager'
import useApiMutation from '../../../hooks/useApiMutation'
import useApiQuery from '../../../hooks/useApiQuery'

const Paths = ({presentMode, setPresentMode, pathMode, setPathMode}) => {
  const {isWriteable, mapId} = useMapStore()
  const eventManager = useInteractionManager()

  const [editingPathId, setEditingPathId] = useState()

  const {data: allPaths, refetch: allPathsRefetch} = useApiQuery({url: `/maps/${mapId}/paths`})
  const editingPath = useMemo(() => allPaths?.find(path => path._id === editingPathId), [allPaths, editingPathId])

  const [updatePath] = useApiMutation({url: `/maps/${mapId}/paths`, onSuccess: () => allPathsRefetch()})

  const [deletePath] = useApiMutation({
    url: `/maps/${mapId}/paths/${editingPathId}`,
    method: 'delete',
    onSuccess: () => allPathsRefetch(),
  })

  const addNewPath = useCallback(
    newPath => {
      updatePath({body: {title: newPath, nodes: [], mapId}})
    },
    [mapId, updatePath],
  )

  const addNodeToPath = useCallback(
    nodeId => {
      updatePath({body: {...editingPath, nodes: [...editingPath.nodes, nodeId]}})
    },
    [editingPath, updatePath],
  )

  const removeNodeFromPath = useCallback(
    nodeIndex => {
      updatePath({
        body: {
          ...editingPath,
          nodes: [...editingPath.nodes.slice(0, nodeIndex), ...editingPath.nodes.slice(nodeIndex + 1)],
        },
      })
    },
    [editingPath, updatePath],
  )

  // @ToDo: beim laden prüfen, ob alle da sind und aktualisiere

  return (
    <div>
      {!presentMode ? null : (
        <PresentingController
          presentMode={presentMode}
          setPathMode={setPathMode}
          setHideController={setPresentMode}
          hideController={presentMode}
          allPaths={allPaths}
          eventManager={eventManager}
        />
      )}
      {!presentMode && pathMode && isWriteable ? (
        <PathsDrawer
          pathMode={pathMode}
          removeNodeFromPath={removeNodeFromPath}
          deletePath={deletePath}
          addNodeToPath={addNodeToPath}
          hidePathsDrawer={pathMode}
          setHidePathsDrawer={setPathMode}
          allPaths={allPaths}
          addNewPath={addNewPath}
          editingPath={editingPath}
          setEditingPathId={setEditingPathId}
        />
      ) : null}
    </div>
  )
}
export default Paths
