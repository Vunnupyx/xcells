import React, {useCallback, useState} from 'react'
import {Field, Form} from 'react-final-form'

import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import CloseIcon from '@material-ui/icons/Close'
import makeStyles from '@material-ui/styles/makeStyles'
import AddIcon from '@material-ui/icons/Add'
import EditIcon from '@material-ui/icons/Edit'

import {FormattedMessage} from 'react-intl'
import ListItem from '@material-ui/core/ListItem'
import Divider from '@material-ui/core/Divider'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import List from '@material-ui/core/List'
import useApiMutation from '../../../../hooks/useApiMutation'
import TextField from '../../../../input/TextField'

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    margin: theme.spacing(0),
  },
  input: {
    width: '100%',
  },
}))

const PathsList = ({hidden, setHidden, setEditingPathId, allPaths, addNewPath}) => {
  const classes = useStyles()
  const [open, setOpen] = useState(false)

  const onClose = () => {
    setOpen(!open)
  }

  const handleClick = item => {
    setHidden(!hidden)
    setEditingPathId(item._id)
  }

  const fn = useCallback(
    async ({category: categoryString}) => {
      addNewPath(categoryString)
    },
    [addNewPath],
  )

  const [onSubmit] = useApiMutation({
    fn,
    onSuccess: () => {
      setOpen(false)
    },
  })

  return (
    <>
      <List className={classes.root}>
        <ListItem>
          <Button
            onClick={() => setOpen(true)}
            className={classes.input}
            variant="outlined"
            color="default"
            endIcon={<AddIcon />}
          >
            Create Path
          </Button>
        </ListItem>
        <Divider variant="middle" />
        {allPaths?.map((item, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={`${item.id}-${index}`}>
            <ListItem onClick={() => handleClick(item)} button>
              <ListItemText primary={item.title} />
              <ListItemSecondaryAction>
                <EditIcon />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider variant="middle" />
          </React.Fragment>
        ))}
      </List>

      <Dialog open={open} onClose={onClose}>
        <Form
          onSubmit={onSubmit}
          render={({handleSubmit, submitting}) => (
            <form onSubmit={handleSubmit}>
              <DialogTitle>
                Create New Path
                <IconButton aria-label="close" onClick={onClose} className={classes.closeButton}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent>
                <Field
                  component={TextField}
                  margin="normal"
                  fullWidth
                  id="category"
                  label="path name"
                  name="category"
                  autoFocus
                  disabled={submitting}
                />
              </DialogContent>

              <DialogActions>
                <Button onClick={onClose}>
                  <FormattedMessage id="cancel" />
                </Button>
                <Button color="primary" onClick={handleSubmit}>
                  <FormattedMessage id="save" />
                </Button>
              </DialogActions>
            </form>
          )}
        />
      </Dialog>
    </>
  )
}
export default PathsList
