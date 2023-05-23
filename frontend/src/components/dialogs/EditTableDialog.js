import React, {useCallback} from 'react'
import {Dialog, DialogActions, DialogContent, DialogTitle, Grid} from '@material-ui/core'
import Button from '@material-ui/core/Button'
import {AgGridReact} from 'ag-grid-react'
import {FormattedMessage} from 'react-intl'

import makeStyles from '@material-ui/styles/makeStyles'
import useEngineControl from '../engine/useEngineControl'
import {trackAction} from '../../contexts/tracking'
import {clone} from '../../utils/object'

const defaultColDef = {
  editable: true,
  resizable: true,
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
  const [gridApi, setGridApi] = React.useState(null)
  const {editTable} = useEngineControl()

  const onSubmit = useCallback(() => {
    gridApi.stopEditing()
    editTable({rowData: clone(gridOptions.rowData), columnDefs: clone(gridOptions.columnDefs)})
    trackAction('nodeEditTable')
  }, [editTable, gridApi, gridOptions.columnDefs, gridOptions.rowData])

  const onGridReady = params => {
    setGridApi(params.api)
  }

  const onDeleteRow = () => {
    const selectedRow = gridApi.getSelectedRows()
    gridApi.applyTransaction({remove: selectedRow})
    const newData = []
    gridApi.forEachNode(node => newData.push(node.data))

    gridOptions.rowData = newData
    gridApi.setRowData(gridOptions.rowData)
  }

  const onAddRow = () => {
    gridApi.applyTransaction({add: [{}]})

    const newData = []
    gridApi.forEachNode(node => newData.push(node.data))

    gridOptions.rowData = newData
    gridApi.setRowData(gridOptions.rowData)
  }

  return (
    <Dialog classes={{paper: classes.dialog}} open={open} onClose={onClose}>
      <DialogTitle>
        <FormattedMessage id="dialog.editTable.title" />
      </DialogTitle>
      <DialogContent>
        <Grid container justifyContent="space-between">
          <Grid item>
            <Button className={classes.button} variant="contained" color="secondary" onClick={onDeleteRow}>
              <FormattedMessage id="dialog.editTable.delete" />
            </Button>
          </Grid>
          <Grid item>
            <Button className={classes.button} variant="contained" color="primary" onClick={onAddRow}>
              <FormattedMessage id="dialog.editTable.add" />
            </Button>
          </Grid>
        </Grid>
        <AgGridReact
          className="ag-theme-alpine"
          gridOptions={gridOptions}
          rowSelection="multiple"
          singleClickEdit
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
        />
      </DialogContent>
      <DialogActions>
        <Button className={classes.button} variant="contained" color="default" onClick={onClose}>
          <FormattedMessage id="cancel" />
        </Button>
        <Button className={classes.button} variant="contained" color="primary" onClick={onSubmit}>
          <FormattedMessage id="dialog.editTable.applyChanges" />
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditTableDialog
