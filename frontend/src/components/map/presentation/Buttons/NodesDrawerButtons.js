import React from 'react'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import makeStyles from '@material-ui/styles/makeStyles'
import Grid from '@material-ui/core/Grid'
import useInteractionManager from '../../../engine/useInteractionManager'
import useMapStore from '../../../../hooks/useMapStore'

const useStyles = makeStyles(theme => ({
  button: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
}))

const NodeDrawerButtons = ({addNodeToPath}) => {
  const classes = useStyles()
  const {lastSelectedNode} = useInteractionManager()
  const {nodes} = useMapStore()

  function shortenStr(mystr, max) {
    if (mystr && mystr.length > max) {
      return `${mystr.substring(0, max - 1)}...`
    }
    return mystr
  }

  const handleAddNode = nodeId => {
    if (nodes[nodeId]) {
      addNodeToPath(nodeId)
    }
  }

  return (
    <Grid container direction="row" justifyContent="space-around" alignItems="center">
      <Grid item xs={5}>
        Selected Card: {shortenStr(lastSelectedNode.title, 40)}
      </Grid>
      <Grid item xs={5}>
        <Button
          onClick={() => handleAddNode(lastSelectedNode.id)}
          size="small"
          variant="contained"
          color="primary"
          className={classes.button}
          startIcon={<AddIcon />}
        >
          Add to path
        </Button>
      </Grid>
    </Grid>
  )
}
export default NodeDrawerButtons
