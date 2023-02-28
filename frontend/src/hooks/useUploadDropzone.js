import React from 'react'
import {FormattedMessage} from 'react-intl'
import {useDropzone} from 'react-dropzone'
import debug from 'debug'

import useMapStore from './useMapStore'
import useSnackbar from './useSnackbar'
import useApiMutation from './useApiMutation'

import {upload} from '../utils/datatransferAndFiles'

const log = debug('app:useUploadDropzone')

export const TYPES = {
  image: 'image',
  file: 'file',
}

const useUploadDropzone = (onSuccess, onFileDialogCancel) => {
  const store = useMapStore()
  const {error, warning} = useSnackbar()

  const fn = async files => {
    // only single selection allowed
    const file = files[0]
    log('upload file', {mapId: store.mapId, file})

    const result = await upload(file, store.mapId, id => warning(<FormattedMessage id={id} />))
    document.body.style.cursor = 'default'

    const {apiAnswer, fileType, metadata} = result
    metadata.fileType = fileType
    return [file, apiAnswer, metadata]
  }

  const [onDrop] = useApiMutation({
    fn,
    onSuccess,
    onError: () => {
      document.body.style.cursor = 'default'
      error(<FormattedMessage id="mapUploadError" />)
    },
  })

  const onDropAccepted = () => {
    document.body.style.cursor = 'wait'
  }

  return useDropzone({
    onDrop,
    onDropAccepted,
    onFileDialogCancel,
    multiple: false,
    noClick: true,
    noKeyboard: true,
  })
}

export default useUploadDropzone
