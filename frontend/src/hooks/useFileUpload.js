import {useCallback, useMemo, useRef} from 'react'
import debug from 'debug'

import {IMAGE_POSITIONS} from '../shared/config/constants'
import useUploadDropzone, {TYPES} from './useUploadDropzone'
import useInteractionManager from '../components/engine/useInteractionManager'
import useEngineControl from '../components/engine/useEngineControl'

const log = debug('app:useFileUpload')

const useFileUpload = () => {
  const control = useEngineControl()
  const uploadSelectedRef = useRef()

  const onImageUploadSuccess = useCallback(
    result => {
      if (result.length === 0) return

      const {_id: id} = result[1]
      const fileData = result[2]
      const {fileType, width, height} = fileData
      const wasSelected = uploadSelectedRef.current
      log('file upload success', {id, fileType, fileData, wasSelected})
      if (fileType === TYPES.image) {
        control.setImageWithPositionAndSize(id, IMAGE_POSITIONS.body, width, height, wasSelected)
      } else if (fileType === TYPES.file) {
        control.setFile(id, wasSelected)
      }
    },
    [control],
  )

  const manager = useInteractionManager()

  const {getInputProps, open: openDialog} = useUploadDropzone(onImageUploadSuccess)

  const openFileDialog = useCallback(() => {
    uploadSelectedRef.current = new Set(manager.selectedNodes)
    openDialog()
  }, [manager, openDialog])

  return useMemo(
    () => ({
      openFileDialog,
      getInputProps,
    }),
    [openFileDialog, getInputProps],
  )
}

export default useFileUpload
