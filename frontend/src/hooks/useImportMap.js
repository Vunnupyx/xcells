import {useMutation} from 'react-query'
import React, {useCallback} from 'react'
import {FormattedMessage} from 'react-intl'
import {useHistory} from 'react-router-dom'

import useSnackbar from './useSnackbar'
import useApiMutation from './useApiMutation'

const useImportMap = () => {
  const {push} = useHistory()
  const {success} = useSnackbar()

  const onJsonSuccess = useCallback(() => success(<FormattedMessage id="mapUploadAlertSuccess" />), [success])

  const [uploadImap] = useApiMutation({url: '/maps/import/imapping'})
  const [uploadJson] = useApiMutation({url: '/maps/import', onSuccess: onJsonSuccess})
  const [createMap] = useApiMutation({url: '/maps'})

  const importMap = useCallback(
    async files => {
      // get the type from the ending
      if (files.length === 0) throw new Error('no file found')

      const file = files[0]

      const {name} = file

      const payload = {body: file, params: {filename: name}}

      let state = {}
      let response
      if (name?.toLowerCase().endsWith('.imap')) {
        response = await uploadImap(payload)
        push(`/maps/${response.mapId}`)
      } else if (name?.toLowerCase().endsWith('.json')) {
        response = await uploadJson(payload)
      } else if (name?.toLowerCase().endsWith('.txt')) {
        response = await createMap()
        state = {importDatas: file}
      } else {
        throw new Error('invalid file type')
      }

      push({
        pathname: `/maps/import/${response.mapId}`,
        // eslint-disable-next-line object-shorthand
        state: {
          wait: response.wait,
          uploadTime: new Date().getTime() / 1000,
          ...state,
        },
      })
    },
    [push, uploadJson, uploadImap, createMap],
  )

  return useMutation(importMap)
}

export default useImportMap
