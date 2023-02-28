import {createElement} from 'react'
import createSvgIcon from '@material-ui/core/utils/createSvgIcon'

// https://materialdesignicons.com/icon/view-grid-plus-outline
const AddTemplate = createSvgIcon(
  /* #__PURE__ */ createElement('path', {
    d: 'M3 21H11V13H3M5 15H9V19H5M3 11H11V3H3M5 5H9V9H5M13 3V11H21V3M19 9H15V5H19M18 16H21V18H18V21H16V18H13V16H16V13H18Z',
  }),
  'AddTemplate',
)

export default AddTemplate
