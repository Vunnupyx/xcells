import React, {useCallback} from 'react'
import PropTypes from 'prop-types'
import {useTable} from 'react-table'

import styled from '@material-ui/core/styles/styled'
import MaUTable from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import ProgressModal from '../ProgressModal'

const HoverRow = styled(TableRow)({
  '&:hover': {
    backgroundColor: '#eee',
    color: 'blue',
    cursor: 'pointer',
  },
})

const Row = ({children, row, rowClick, rowMiddleClick, ...rowProps}) => {
  const onClick = useCallback(() => rowClick && rowClick(row), [row, rowClick])
  const onMiddleClick = useCallback(() => rowMiddleClick && rowMiddleClick(row), [row, rowMiddleClick])

  return (
    <HoverRow {...row.getRowProps()} onClick={onClick} onAuxClick={onMiddleClick} {...rowProps}>
      {children}
    </HoverRow>
  )
}

const Table = ({data, columns, rowClick, rowMiddleClick, isLoading, getRowId, ...props}) => {
  const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} = useTable({
    columns,
    data,
    getRowId,
  })

  return (
    <MaUTable {...getTableProps()} {...props}>
      <TableHead>
        {headerGroups.map(g => (
          // key is set by "getHeaderGroupProps"
          // eslint-disable-next-line react/jsx-key
          <TableRow {...g.getHeaderGroupProps()}>
            {g.headers.map(col => (
              // key is set by "getHeaderProps"
              // eslint-disable-next-line react/jsx-key
              <TableCell {...col.getHeaderProps()}>{col.render('Header')}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableHead>
      <TableBody {...getTableBodyProps()}>
        {(!data || !data.length) && isLoading ? (
          <ProgressModal />
        ) : (
          rows.map(row => {
            prepareRow(row)
            return (
              <Row
                key={row.getRowProps().key}
                row={row}
                rowClick={rowClick}
                rowMiddleClick={rowMiddleClick}
                {...row.getRowProps()}
              >
                {row.cells.map(cell => (
                  <TableCell key={cell.getCellProps().key} {...cell.getCellProps()}>
                    {cell.render('Cell')}
                  </TableCell>
                ))}
              </Row>
            )
          })
        )}
      </TableBody>
    </MaUTable>
  )
}

Table.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  rowClick: PropTypes.func,
}
Table.defaultProps = {
  rowClick: null,
}

export default Table
