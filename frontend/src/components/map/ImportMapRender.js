import {useLocation} from 'react-router-dom'
import {useEffect} from 'react'
import useMapStore from '../../hooks/useMapStore'
import useSnackbar from '../../hooks/useSnackbar'
import useInteractionManager from '../engine/useInteractionManager'

const ImportMapRender = () => {
  const {importDatas, importRoot} = useLocation().state || {}
  const {importer} = useInteractionManager(false)
  const {root, isLoading, isWriteable} = useMapStore()
  const {error} = useSnackbar()

  const parentId = importRoot || root

  useEffect(() => {
    if (importDatas && !isLoading && isWriteable) {
      const doImport = async () => {
        try {
          await importer.runImport(importDatas, parentId)
        } catch (e) {
          error(e.message)
        }
      }
      doImport()
    }
  }, [importer, importDatas, isLoading, isWriteable, parentId, error])

  return null
}

export default ImportMapRender
