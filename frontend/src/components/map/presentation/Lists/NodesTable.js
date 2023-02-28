import React from 'react'
import makeStyles from '@material-ui/styles/makeStyles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import useMapStore from '../../../../hooks/useMapStore'
import useInteractionManager from '../../../engine/useInteractionManager'

const useStyles = makeStyles(theme => ({
  table: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '90%',
  },
}))

const NodesTable = ({editingPath, removeNodeFromPath}) => {
  const classes = useStyles()
  const {nodes} = useMapStore()
  const eventManager = useInteractionManager(false)

  function shortenStr(mystr, max) {
    if (mystr && mystr.length > max) {
      return `${mystr.substring(0, max - 1)}...`
    }
    return mystr
  }

  const handleRemove = (event, index) => {
    removeNodeFromPath(index)
    event.stopPropagation()
  }

  const handleClick = (event, name) => {
    if (nodes[name]) {
      eventManager.zoomToNode(name)
    }
  }

  return (
    <TableContainer component={Paper} className={classes.table}>
      <Table stickyHeader size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell align="left">Card Name</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {editingPath?.nodes?.map((nodeId, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <TableRow hover onClick={event => handleClick(event, nodeId)} key={`${nodeId}-${index}`}>
              <TableCell>{index + 1}</TableCell>
              <TableCell align="left">{nodes[nodeId] ? shortenStr(nodes[nodeId].title, 40) : null}</TableCell>
              <TableCell align="right">
                <IconButton onClick={event => handleRemove(event, index)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
export default NodesTable
