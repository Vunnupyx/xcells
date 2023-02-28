import React, {createContext, useCallback, useState} from 'react'

export const DialogContext = createContext()

const stopPropagation = event => {
  event.stopPropagation()
}

const DialogProvider = ({children}) => {
  const [Dialog, setDialog] = useState()
  const [dialogProps, setDialogProps] = useState()

  const openDialog = useCallback(
    (Component, props = {}) => {
      setDialog(() => Component)
      setDialogProps(props)
    },
    [setDialog, setDialogProps],
  )

  const onClose = useCallback(() => {
    setDialog()
    setDialogProps()
  }, [setDialog, setDialogProps])

  return (
    <>
      <DialogContext.Provider value={openDialog}>{children}</DialogContext.Provider>
      {Dialog ? <Dialog open onClose={onClose} {...dialogProps} onKeyDown={stopPropagation} /> : null}
    </>
  )
}

export default DialogProvider
