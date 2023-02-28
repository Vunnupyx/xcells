import React, {useState} from 'react'
import makeStyles from '@material-ui/styles/makeStyles'
import Drawer from '@material-ui/core/Drawer'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import CloseIcon from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton'
import Grid from '@material-ui/core/Grid'
import Zoom from '@material-ui/core/Zoom'
import NodesDrawerButtons from './Buttons/NodesDrawerButtons'
import NodesTable from './Lists/NodesTable'
import PathsList from './Lists/PathsList'
import DeleteButton from './Buttons/DeleteButton'

const drawerWidth = 400

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    backgroundColor: theme.palette.background.grauBlue5,
    width: drawerWidth,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
  header: {
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}))

const PathsDrawer = ({
  pathMode,
  removeNodeFromPath,
  deletePath,
  hidePathsDrawer,
  setHidePathsDrawer,
  allPaths,
  editingPath,
  setEditingPathId,
  addNewPath,
  addNodeToPath,
}) => {
  const classes = useStyles()

  const [hidden, setHidden] = useState(false)

  const handleBack = () => {
    setHidden(!hidden)
    setEditingPathId(null)
  }
  return (
    <Zoom in={pathMode} timeout={100}>
      <div className={classes.root}>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          hidden={hidden}
          classes={{
            paper: classes.drawerPaper,
          }}
          anchor="right"
        >
          <Grid container direction="row">
            <Grid item xs={10}>
              <Typography color="primary" className={classes.header} align="left" variant="h6">
                Add / Edit Path for Presentation
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <IconButton onClick={() => setHidePathsDrawer(!hidePathsDrawer)}>
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
          <Divider />
          <PathsList
            addNewPath={addNewPath}
            hidden={hidden}
            setHidden={setHidden}
            setEditingPathId={setEditingPathId}
            allPaths={allPaths}
          />
          <Divider />
        </Drawer>

        <Drawer
          className={classes.drawer}
          variant="permanent"
          hidden={!hidden}
          classes={{
            paper: classes.drawerPaper,
          }}
          anchor="right"
        >
          <Grid container direction="row">
            <Grid item xs={1}>
              <IconButton onClick={() => handleBack()}>
                <ArrowBackIosIcon />
              </IconButton>
            </Grid>
            <Grid item xs={5}>
              <Typography color="secondary" className={classes.header} align="left" variant="h6">
                {editingPath?.title}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <DeleteButton deletePath={deletePath} handleBack={handleBack} editingPath={editingPath} />
            </Grid>
          </Grid>
          <Divider />
          <NodesDrawerButtons selectedPath={editingPath} addNodeToPath={addNodeToPath} />
          <Divider variant="middle" />
          <NodesTable allPaths={allPaths} editingPath={editingPath} removeNodeFromPath={removeNodeFromPath} />
        </Drawer>
      </div>
    </Zoom>
  )
}
export default PathsDrawer
