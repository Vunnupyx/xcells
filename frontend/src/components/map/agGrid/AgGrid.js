import React, {useState} from 'react'
import {AgGridReact} from 'ag-grid-react'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const AgGrid = () => {
  const [rowData, setRowData] = useState([
    {make: 'Porsche', model: 'Boxter', price: 72000},
    {make: 'Ford', model: 'Mondeo', price: 32000},
    {make: 'Ford', model: 'Mondeo', price: 32000},
    {make: 'Toyota', model: 'Celica', price: 35000},
    {make: 'Toyota', model: 'Celica', price: 35000},
    {make: 'Porsche', model: 'Boxter', price: 72000},
    {make: 'Toyota', model: 'Celica', price: 35000},
    {make: 'Toyota', model: 'Celica', price: 35000},
  ]) // Set rowData to Array of Objects, one Object per Row

  // Each Column Definition results in one Column.
  const [columnDefs, setColumnDefs] = useState([{field: 'make'}, {field: 'model'}, {field: 'price'}])

  return (
    <div className="ag-theme-alpine" style={{height: 400, width: 600}}>
      <AgGridReact rowData={rowData} columnDefs={columnDefs} />
    </div>
  )
}

export default AgGrid
