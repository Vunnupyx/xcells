import React, {useEffect, useMemo, useState} from 'react'
import {useSessionStorage} from 'react-use'

import makeStyles from '@material-ui/styles/makeStyles'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableSortLabel,
  TableRow,
  TextField,
  Grid,
} from '@material-ui/core'
import {FormattedMessage} from 'react-intl'
import useSnackbar from '../../../hooks/useSnackbar'
import useApi from '../../../hooks/useApi'

const StringCell = ({value}) => {
  const ind = value.indexOf('@')
  if (value.length > 15 && ind > 14) {
    return `${value.substring(0, ind)}\n${value.substring(ind)}`
  }
  return value
}

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 1200,
  },
  tableHead: {
    backgroundColor: theme.palette.background.lachs10,
    color: theme.palette.background.lachs10,
  },
  container: {
    width: '100%',
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  cardRoot: {
    maxWidth: 120,
  },
}))

export default function WaitlistTable({initialWaitlist}) {
  const classes = useStyles()
  const api = useApi()
  const {success, error} = useSnackbar()

  const [waitlist, setWaitlist] = React.useState(initialWaitlist)
  const [searchField, setSearchField] = useState('')
  const [page, setPage] = useState(0)

  const [orderBy, setOrderBy] = useSessionStorage('orderBy', 'userId')
  const [order, setOrder] = useSessionStorage('order', 'desc')
  const [rowsPerPage, setRowsPerPage] = useSessionStorage('rowsPerPage', '25')

  useEffect(() => {
    let pageView = Number(sessionStorage.getItem('page'))
    let searchFieldStorage = sessionStorage.getItem('searchField')
    if (pageView == null) {
      pageView = 0
    }

    if (searchFieldStorage == null) {
      searchFieldStorage = ''
    }
    sessionStorage.setItem('page', pageView)
    setPage(pageView)

    sessionStorage.setItem('searchField', searchFieldStorage)
    setSearchField(searchFieldStorage)
  }, [])

  window.onunload = () => {
    sessionStorage.removeItem('page')
    sessionStorage.removeItem('searchField')
  }

  const rows = useMemo(
    () =>
      Object.values(waitlist)
        .filter(value =>
          searchField
            .toLowerCase()
            .split(' ')
            .every(w => [value.id, value.name, value.mail].toString().toLowerCase().includes(w)),
        )

        .map(value => ({
          userId: value.id,
          name: value.name,
          mail: value.mail,
        })),
    [waitlist, searchField],
  )

  const columns = [
    {id: 'userId', label: 'ID'},
    {id: 'name', label: 'Username', Cell: StringCell},
    {id: 'mail', label: 'Email', Cell: StringCell},
  ]

  function descendingComparator(a, b, orderByComp) {
    if (b[orderByComp] < a[orderByComp]) {
      return -1
    }
    if (b[orderByComp] > a[orderByComp]) {
      return 1
    }
    return 0
  }

  function getComparator(orderComp, orderByComp) {
    return orderComp === 'desc'
      ? (a, b) => descendingComparator(a, b, orderByComp)
      : (a, b) => -descendingComparator(a, b, orderByComp)
  }

  const createSortHandler = property => () => {
    const isAsc = orderBy === property && order === 'asc'
    const inOrder = isAsc ? 'desc' : 'asc'
    setOrder(inOrder)
    setOrderBy(property)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
    sessionStorage.setItem('page', newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }
  const handleChange = e => {
    setSearchField(e.target.value)
    sessionStorage.setItem('searchField', e.target.value)
    setPage(0)
  }

  const onActivate = async id => {
    try {
      await api.get(`/statistics/waitlist/confirm/${id}`)
      setWaitlist(waitlist.filter(waitItem => waitItem.id !== id))
      success(<FormattedMessage id="admin.crm.waitlist.ActivateAccountSuccess" />)
    } catch {
      error(<FormattedMessage id="admin.crm.waitlist.ActivateAccountError" />)
    }
  }

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index])
    stabilizedThis.sort((a, b) => {
      const comparateOrder = comparator(a[0], b[0])
      if (comparateOrder !== 0) return comparateOrder

      return a[1] - b[1]
    })
    return stabilizedThis.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(el => el[0])
  }

  return (
    <div>
      <Grid container classes={{root: classes.root}} spacing={3}>
        <Grid item>
          <div>
            <TextField
              InputLabelProps={{
                style: {
                  width: '300px',
                },
              }}
              InputProps={{
                style: {
                  width: '250px',
                  backgroundColor: 'white',
                },
              }}
              margin="dense"
              value={searchField}
              size="small"
              label="Search"
              variant="outlined"
              onChange={handleChange}
            />
          </div>
        </Grid>
      </Grid>
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="waitlist crm table">
          <TableHead>
            <TableRow>
              {columns.map(headCell => (
                <TableCell key={headCell.id} sortDirection={orderBy === headCell.id ? order : false}>
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'desc'}
                    onClick={createSortHandler(headCell.id)}
                  >
                    {headCell.label}
                    {orderBy === headCell.id ? (
                      <span className={classes.visuallyHidden}>
                        {order === 'asc' ? 'sorted ascending' : 'sorted descending'}
                      </span>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stableSort(rows, getComparator(order, orderBy)).map(row => {
              return (
                <TableRow tabIndex={-1} key={row?.userId}>
                  {columns.map(({Cell, id, align}) => (
                    <TableCell key={id} align={align} size="small">
                      {Cell ? <Cell row={row} value={row[id]} /> : row[id]}
                    </TableCell>
                  ))}
                  <TableCell size="small">
                    <Button onClick={() => onActivate(row.userId)} variant="outlined">
                      Approve
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[25, 50, 100]}
        component="div"
        count={rows?.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  )
}
