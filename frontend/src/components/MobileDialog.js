import Dialog from '@material-ui/core/Dialog'
import withMobileDialog from '@material-ui/core/withMobileDialog'

const MobileDialog = withMobileDialog({breakpoint: 'xs'})(Dialog)

export default MobileDialog
