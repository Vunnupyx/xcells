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
  sortable: true,
  filter: 'agTextColumnFilter',
  rowDrag: true,
}

const useStyles = makeStyles(theme => ({
  button: {
    textTransform: 'none',
    marginBottom: theme.spacing(1),
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
  },
  dialog: {
    width: '100%',
    maxWidth: '90vw',
  },
}))

const EditTableDialog = ({gridOptions, open, onClose}) => {
  const classes = useStyles()
  const [gridApi, setGridApi] = React.useState(null)
  const [columnApi, setColumnApi] = React.useState(null)
  const {editTable} = useEngineControl()

  const onSubmit = useCallback(() => {
    gridApi.stopEditing()
    editTable({
      rowData: clone(gridOptions.rowData),
      columnDefs: clone(gridOptions.columnDefs),
      filterModel: gridApi.getFilterModel(),
      columnState: columnApi.getColumnState(),
    })
    trackAction('nodeEditTable')
    onClose()
  }, [gridApi, columnApi, editTable, gridOptions.columnDefs, gridOptions.rowData, onClose])

  const onGridReady = params => {
    setGridApi(params.api)
    setColumnApi(params.columnApi)
    params.api.sizeColumnsToFit()
  }

  const onSaveGridRow = () => {
    const rowData = []
    gridApi.forEachNode(node => rowData.push(node.data))
    gridOptions.rowData = rowData
  }

  const onDeleteRow = () => {
    const selectedRow = gridApi.getSelectedRows()
    gridApi.applyTransaction({remove: selectedRow})
    onSaveGridRow()
  }

  const onAddRow = () => {
    gridApi.applyTransaction({add: [{}]})
    onSaveGridRow()
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
          domLayout="autoHeight"
          singleClickEdit
          enableMultiRowDragging
          rowDragManaged
          stopEditingWhenGridLosesFocus
          suppressDragLeaveHidesColumns
          onRowDragEnd={onSaveGridRow}
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
