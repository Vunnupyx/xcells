import React, {useEffect, useMemo, useState} from 'react'
import {useSessionStorage} from 'react-use'
import {useHistory} from 'react-router-dom'

import makeStyles from '@material-ui/styles/makeStyles'
import Button from '@material-ui/core/Button'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import TableRow from '@material-ui/core/TableRow'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'

import {ROLES} from '../../../shared/config/constants'

const convertDate = value => {
  const date = new Date(value)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

const RoleCell = ({value}) => (value ? '✓' : '✖')

const DateCell = ({value}) => {
  return new Date(value).getTime() === new Date(+0).getTime() ||
    new Date(value).getTime() === new Date(999999999999999).getTime()
    ? '-'
    : convertDate(value)
}

const NumberCell = ({value}) => (value || value !== 0 ? value : '-')

const StringCell = ({value}) => {
  const ind = value.indexOf('@')
  if (value.length > 15 && ind > 14) {
    return `${value.substring(0, ind)}\n${value.substring(ind)}`
  }
  return value
}

const FieldsOfWorkCell = ({value}) => {
  return (
    Object.values(value)
      .filter(v => v !== null)
      .toString() || '-'
  )
  // value?.some(el => el !== null || 'null') ? value : '-'
}

const toCsv = objArray => {
  const convertDateToCsv = value => {
    if (
      new Date(value).getTime() === new Date(+0).getTime() ||
      new Date(value).getTime() === new Date(999999999999999).getTime()
    )
      return ''
    const date = new Date(value)
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  }

  const convertedObjArray = objArray.map(obj => {
    obj.createdAt = convertDateToCsv(obj.createdAt)
    obj.lastMapChange = convertDateToCsv(obj.lastMapChange)
    delete obj.fieldsOfWork[0]
    obj.fieldsOfWork = Object.entries(obj.fieldsOfWork)
      .filter(([, v]) => v !== null)
      .map(([k]) => k.toString())
    delete obj.detailView
    delete obj.mapIds
    return obj
  })
  const arr = typeof convertedObjArray !== 'object' ? JSON.parse(convertedObjArray) : convertedObjArray
  const str = `${Object.keys(arr[0])
    .map(value => `"${value}"`)
    .join(',')}\r\n`
  const csvContent = arr.reduce((st, next) => {
    st += `${Object.values(next)
      .map(value => `"${value !== null ? value : ''}"`)
      .join(',')}\r\n`
    return st
  }, str)
  const element = document.createElement('a')
  element.href = `data:text/csv;charset=utf-8,${encodeURI(csvContent)}`
  element.target = '_blank'
  element.download = 'export.csv'
  element.click()
}

const highestRole = roles => {
  if (roles?.includes(ROLES.administrator)) return ROLES.administrator
  if (roles?.includes(ROLES.org_subscriber)) return ROLES.org_subscriber
  if (roles?.includes(ROLES.subscriber)) return ROLES.subscriber
  return ROLES.customer
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

export default function StickyHeadTable({data}) {
  const classes = useStyles()
  const history = useHistory()

  const [searchField, setSearchField] = useState('')
  const [state, setState] = useState({hideAdmins: true})
  const [page, setPage] = useState(0)

  const [orderBy, setOrderBy] = useSessionStorage('orderBy', 'userId')
  const [order, setOrder] = useSessionStorage('order', 'desc')
  const [rowsPerPage, setRowsPerPage] = useSessionStorage('rowsPerPage', '25')

  useEffect(() => {
    let pageView = sessionStorage.getItem('page')
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
      Object.values(data)
        .filter(value => (state.hideAdmins ? !value.roles.includes(ROLES.administrator) : value))
        .filter(value =>
          searchField
            .toLowerCase()
            .split(' ')
            .every(w =>
              [
                value.id,
                value.name,
                value.mail,
                value.comment,
                value.mapIds,
                JSON.stringify(value.meta.store, (k, v) => v ?? undefined),
                highestRole(value.roles),
              ]
                .toString()
                .toLowerCase()
                .includes(w),
            ),
        )

        .map(value => ({
          userId: Number(value.id),
          name: value.name,
          mail: value.mail,
          fieldsOfWork: value.meta?.store?.fieldsOfWork,
          mapCount: value.mapCount || 0,
          mapShareCount: value.mapShareCount || 0,
          sharedWithCount: value.sharedWithCount || 0,
          nodeCount: value.nodeCount || 0,
          biggestMapCount: value.biggestMapCount || 0,
          nodeLimit: value.nodeLimit || 0,
          subscriber:
            (value.roles.includes(ROLES.subscriber) || value.roles.includes(ROLES.org_subscriber)) &&
            !value.roles.includes(ROLES.administrator),
          createdAt: value.createdAt,
          mapIds: value.mapIds || null,
          lastMapChange: value.lastMapChange
            ? new Date(value.lastMapChange)
            : order === 'asc' && orderBy === 'lastMapChange'
            ? new Date(999999999999999)
            : new Date(null),
          ...value.meta.store,
          comment: value.comment || '',
        })),
    [data, searchField, order, orderBy, state.hideAdmins],
  )

  const sumStats = useMemo(() => {
    if (!rows.length)
      return {
        userCount: 0,
        mapCount: 0,
        mapShareCount: 0,
        nodeCount: 0,
        subscriber: 0,
        sharedWithCount: 0,
      }
    return Object.values(rows)
      .map(item => {
        return {
          userCount: 1,
          mapCount: item.mapCount,
          mapShareCount: item.mapShareCount,
          nodeCount: item.nodeCount,
          subscriber: item.subscriber ? 1 : 0,
          sharedWithCount: item.sharedWithCount,
        }
      })
      .reduce((a, b) => ({
        userCount: a.userCount + b.userCount,
        mapCount: a.mapCount + b.mapCount,
        mapShareCount: a.mapShareCount + b.mapShareCount,
        nodeCount: a.nodeCount + b.nodeCount,
        subscriber: a.subscriber + b.subscriber,
        sharedWithCount: a.sharedWithCount + b.sharedWithCount,
      }))
  }, [rows])

  const columns = [
    {id: 'userId', label: `Id (${sumStats.userCount})`},
    {id: 'name', label: 'Username', Cell: StringCell},
    {id: 'mail', label: 'Email', Cell: StringCell},
    {id: 'fieldsOfWork', label: 'Field Of Work', Cell: FieldsOfWorkCell},
    {id: 'mapCount', label: `Own Maps (${sumStats.mapCount})`, Cell: NumberCell},
    {id: 'mapShareCount', label: `Shared Maps (${sumStats.mapShareCount})`, Cell: NumberCell},
    {id: 'sharedWithCount', label: `Shared With (${sumStats.sharedWithCount})`, Cell: NumberCell},
    {id: 'nodeCount', label: `Total Cards (${sumStats.nodeCount})`, Cell: NumberCell},
    {id: 'biggestMapCount', label: 'Most Cards', Cell: NumberCell},
    {id: 'nodeLimit', label: 'Card Limit', Cell: NumberCell},
    {id: 'subscriber', label: `Paid (${sumStats.subscriber})`, Cell: RoleCell},
    {
      id: 'createdAt',
      label: 'Signed Up',
      Cell: DateCell,
    },
    {id: 'lastMapChange', label: 'Last Change', Cell: DateCell},
  ]

  // table sort components

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

  const handleCheckbox = event => {
    setState({...state, [event.target.name]: event.target.checked})
    setPage(0)
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
  // end table sort components
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
        <Grid item xs={4}>
          <FormControlLabel
            style={{paddingTop: '5px'}}
            control={
              <Checkbox
                defaultChecked
                checked={state.hideAdmins}
                onChange={handleCheckbox}
                name="hideAdmins"
                color="primary"
                inputProps={{'aria-label': 'secondary checkbox'}}
              />
            }
            label="Hide Admins"
          />
        </Grid>
        <Grid item xs align="right">
          <Button
            variant="contained"
            type="button"
            onClick={() => {
              toCsv(rows)
            }}
          >
            Download (CSV)
          </Button>
        </Grid>
      </Grid>
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky crm table">
          <TableHead>
            {' '}
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
            </TableRow>
          </TableHead>
          <TableBody>
            {stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
              const labelId = `enhanced-table-checkbox-${index}`
              return (
                <TableRow hover tabIndex={-1} key={row?.userId} onClick={() => history.push(`users/${row.userId}`)}>
                  {columns.map(({Cell, id, align}) => (
                    <TableCell id={labelId} key={id} align={align} size="small">
                      {Cell ? <Cell row={row} value={row[id]} /> : row[id]}
                    </TableCell>
                  ))}
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
