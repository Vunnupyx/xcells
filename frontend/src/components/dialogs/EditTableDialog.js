import React, {useCallback, useRef} from 'react'
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core'
import Button from '@material-ui/core/Button'
import {AgGridReact} from 'ag-grid-react'
import {FormattedMessage} from 'react-intl'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import makeStyles from '@material-ui/styles/makeStyles'
import useEngineControl from '../engine/useEngineControl'
import {trackAction} from '../../contexts/tracking'

const defaultColDef = {
  editable: true,
}

const useStyles = makeStyles(theme => ({
  button: {
    textTransform: 'none',
    marginBottom: theme.spacing(1),
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
  },
  dialog: {
    width: '100%',
    height: '50%',
  },
}))

const EditTableDialog = ({gridOptions, open, onClose}) => {
  const classes = useStyles()
  const gridRef = useRef()
  const {editTable} = useEngineControl()
  const rowData = [
    {
      id: 0,
      name: 'Username',
      type: 'Scripted',
      language: 'English',
      genres: 'Nature',
      runtime: '30',
      status: 'Ended',
    },
    {
      id: 1,
      name: 'Username',
      type: 'Scripted',
      language: 'English',
      genres: 'Nature',
      runtime: '30',
      status: 'Ended',
    },
  ]

  const columnDefs = [
    {field: 'name'},
    {field: 'type'},
    {field: 'language'},
    {field: 'genres'},
    {field: 'runtime'},
    {field: 'status'},
  ]

  const onSubmit = useCallback(() => {
    gridRef.current.api.stopEditing()
    editTable({columnDefs, rowData})
    trackAction('nodeEditTable')
  }, [columnDefs, editTable, gridOptions, rowData])

  return (
    <Dialog
      classes={{paper: classes.dialog}}
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        <FormattedMessage id="dialog.editTable.title" />
      </DialogTitle>
      <DialogContent>
        <AgGridReact
          ref={gridRef}
          className="ag-theme-alpine"
          columnDefs={columnDefs}
          rowData={rowData}
          defaultColDef={defaultColDef}
        />
      </DialogContent>
      <DialogActions>
        <Button className={classes.button} variant="contained" color="default" onClick={onClose}>
          <FormattedMessage id="cancel" />
        </Button>
        <Button className={classes.button} variant="contained" color="primary" onClick={onSubmit}>
          <FormattedMessage id="save" />
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditTableDialog
