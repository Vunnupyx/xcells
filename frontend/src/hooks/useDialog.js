import {useContext} from 'react'

import {DialogContext} from '../contexts/dialog'

const useDialog = () => useContext(DialogContext)

export default useDialog
