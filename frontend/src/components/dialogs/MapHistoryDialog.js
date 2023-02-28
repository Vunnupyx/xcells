import React, {useState} from 'react'
import {FormattedMessage, useIntl} from 'react-intl'

import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'
import Accordion from '@material-ui/core/Accordion'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Button from '@material-ui/core/Button'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Typography from '@material-ui/core/Typography'
import SearchIcon from '@material-ui/icons/Search'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'

import InputAdornment from '@material-ui/core/InputAdornment'
import Box from '@material-ui/core/Box'
import Table from '../table/Table'

/*
 nodeMove: 'Node moved',
 nodeResize: 'Node resized',
 nodeEdit: 'Node title edited',
 nodeAdd: 'Node added',
 nodeScale: 'Node scaled',
 nodeSetImage: 'Node background image added',
 nodeSetImagePosition: 'Node image position changed',
 nodeSetFile: 'Node file added',
 nodeSetColor: 'Node colored',
 nodeSetBorderColor: 'Node border colored',
 nodeRemove: 'Node removed',
 nodeDuplicate: 'Node duplicated',
 nodeAll: 'Node multi change',
 edgeAdd: 'Edge added',
 templateAdd: 'Template added',
 edgeRemove: 'Edge removed',
 edgeSetColor: 'Edge colored',
 nodeEditEdge: 'Edge title edited', */

const opsColumns = [
  {
    Header: <FormattedMessage id="history.opsTable.type" />,
    accessor: 'action',
  },
  {
    Header: <FormattedMessage id="history.opsTable.objId" />,
    accessor: 'obj',
  },
  {
    Header: <FormattedMessage id="history.opsTable.key" />,
    accessor: 'key',
  },
  {
    Header: <FormattedMessage id="history.opsTable.value" />,
    accessor: 'value',
  },
]

const MapHistoryDialog = ({open, onClose, store}) => {
  // TODO: links to the edited node, currently a connection from obj UUID from Automerge to object in data is missing
  // const isNodeAction = actionName => actionName.startsWith('node') && !actionName.endsWith('Edge')
  // const goToNode = useCallback(
  //   id => {
  //     onClose()
  //     engine.goToNode(id)
  //   },
  //   [onClose, engine],
  // )
  //
  // const nodeExists = useCallback(id => Boolean(engine.renderNodes[id]), [engine])

  const intl = useIntl()

  const [searchTerm, setSearchTerm] = useState(null)

  const {changes} = store

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        <FormattedMessage id="history.title" />
      </DialogTitle>
      <DialogContent>
        <Box marginBottom={1}>
          <Grid container direction="row" justifyContent="flex-end">
            <Grid item>
              <TextField
                onChange={event => setSearchTerm(event.target.value)}
                variant="outlined"
                label={<FormattedMessage id="history.searchLabel" />}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>
        {changes.map(state => {
          const {change, snapshot} = state

          if (
            searchTerm &&
            !(
              change.message &&
              change.message
                .split(',')
                .find(actionName => intl.formatMessage({id: `history.actions.${actionName}`}).includes(searchTerm))
            ) &&
            !change.ops.find(op => op.key?.includes(searchTerm) || op.value?.toString().includes(searchTerm))
          ) {
            return null
          }

          return (
            <Accordion key={`${change.actor}---${change.seq}`}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid container direction="row" justifyContent="space-between">
                  <Grid item>
                    <Typography variant="h6">
                      {change.message ? (
                        <>
                          {change.message.split(',').map((actionName, i) => (
                            <>
                              {i > 0 ? ', ' : ''}
                              <FormattedMessage key={actionName} id={`history.actions.${actionName}`} />
                            </>
                          ))}{' '}
                          <Typography variant="caption">({change.message})</Typography>
                        </>
                      ) : (
                        <FormattedMessage id="history.noMessage" />
                      )}{' '}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <FormattedMessage id="history.nodes" />: {Object.keys(snapshot.nodes || {}).length},{' '}
                    <FormattedMessage id="history.edges" />: {Object.keys(snapshot.edges || {}).length}
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Table data={change.ops} columns={opsColumns} />
              </AccordionDetails>
            </Accordion>
          )
        })}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          <FormattedMessage id="button.close" />
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MapHistoryDialog
