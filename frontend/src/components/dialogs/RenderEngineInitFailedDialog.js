import React from 'react'
import {FormattedMessage} from 'react-intl'
import Button from '@material-ui/core/Button'
import MuiLink from '@material-ui/core/Link'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContentText from '@material-ui/core/DialogContentText'
import Link from '../wrapped/Link'
import checkWebGL from '../../utils/checkWebGL'

const isWebGLSupported = checkWebGL()

const RenderEngineInitFailedDialog = ({open, onClose}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>
      <FormattedMessage id="renderEngineInitErrorTitle" />
    </DialogTitle>
    <DialogContent>
      <DialogContentText>
        {isWebGLSupported ? (
          <FormattedMessage id="renderEngineInitErrorUnknown" />
        ) : (
          <FormattedMessage id="renderEngineInitErrorWebGl" />
        )}
      </DialogContentText>
    </DialogContent>
    {isWebGLSupported ? (
      <DialogActions>
        <Link to="/maps">
          <Button variant="contained">
            <FormattedMessage id="buttonHome" />
          </Button>
        </Link>{' '}
        <Button color="primary" variant="contained" onClick={() => window.location.reload(false)}>
          <FormattedMessage id="buttonReload" />
        </Button>
      </DialogActions>
    ) : (
      <DialogActions>
        <MuiLink href="https://get.webgl.org">
          <Button variant="contained">
            <FormattedMessage id="buttonDetails" />
          </Button>
        </MuiLink>{' '}
        <MuiLink href="https://infinitymaps.io/faq/#webgl">
          <Button color="primary" variant="contained">
            <FormattedMessage id="buttonGetWebGl" />
          </Button>
        </MuiLink>
      </DialogActions>
    )}
  </Dialog>
)

export default RenderEngineInitFailedDialog
