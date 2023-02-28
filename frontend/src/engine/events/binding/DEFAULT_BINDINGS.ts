import pointerActionNames from '../actions/pointer/pointerActionNames'
import NODE_ELEMENT_TYPES from '../../elements/node/NODE_ELEMENT_TYPES'
import EDIT_MODES from '../EDIT_MODES'
import POINTER_PRESS_TYPES from '../POINTER_PRESS_TYPES'
import BUTTONS from './BUTTONS'
import EDGE_ELEMENT_TYPES from '../../elements/edge/EDGE_ELEMENT_TYPES'
import {PointerBinding} from '../../types'
import GHOST_ELEMENT_TYPES from '../../elements/node/GHOST_ELEMENT_TYPES'

const nodeEverywhere = [
  NODE_ELEMENT_TYPES.headerHandle,
  NODE_ELEMENT_TYPES.text,
  NODE_ELEMENT_TYPES.background,
  NODE_ELEMENT_TYPES.container,
]
const edgeEverywhere = [EDGE_ELEMENT_TYPES.arrow, EDGE_ELEMENT_TYPES.line, EDGE_ELEMENT_TYPES.text]

const DEFAULT_BINDINGS: PointerBinding[] = [
  {
    actionName: pointerActionNames.NodeCheckBoxToggle,
    element: [NODE_ELEMENT_TYPES.checkBox],
  },

  // this needs to be before the NodeSelect action, so the card is not selected, when this is executed
  {
    actionName: pointerActionNames.NodeFollowUrl,
    element: [NODE_ELEMENT_TYPES.text],
  },

  {
    actionName: pointerActionNames.NodeMove,
    element: [NODE_ELEMENT_TYPES.headerHandle, NODE_ELEMENT_TYPES.text],
    mode: EDIT_MODES.navigate,
  },
  {
    actionName: pointerActionNames.NodeMove,
    element: nodeEverywhere,
    mode: EDIT_MODES.moveNode,
  },
  {
    actionName: pointerActionNames.NodeMove,
    element: [NODE_ELEMENT_TYPES.background, NODE_ELEMENT_TYPES.headerHandle],
    type: POINTER_PRESS_TYPES.long,
  },
  // disabled in favor of context menu
  // {
  //   actionName: pointerActionNames.NodeMove,
  //   element: nodeEverywhere,
  //   buttons: BUTTONS.right,
  // },

  {
    actionName: pointerActionNames.NodeDecollapse,
    element: NODE_ELEMENT_TYPES.resizeHandle,
  },

  {
    actionName: pointerActionNames.NodeSelect,
    element: nodeEverywhere,
    mode: [EDIT_MODES.navigate, EDIT_MODES.moveNode],
  },
  // {
  //   actionName: pointerActionNames.NodeSelect,
  //   element: nodeEverywhere,
  //   buttons: BUTTONS.right,
  // },

  {
    actionName: pointerActionNames.NodeZoomTo,
    element: [
      NODE_ELEMENT_TYPES.container,
      NODE_ELEMENT_TYPES.background,
      NODE_ELEMENT_TYPES.headerHandle,
      NODE_ELEMENT_TYPES.text,
    ],
    type: POINTER_PRESS_TYPES.double,
  },

  {
    actionName: pointerActionNames.NodeResize,
    element: NODE_ELEMENT_TYPES.resizeHandle,
  },
  {
    actionName: pointerActionNames.NodeResize,
    element: [NODE_ELEMENT_TYPES.resizeHandle, NODE_ELEMENT_TYPES.background],
    buttons: BUTTONS.middle,
  },
  // TODO: this does not work yet, the handler does not abort an ongoing drag action, if a new down action occurs
  // {
  //   actionName: pointerActionNames.NodeResize,
  //   element: [NODE_ELEMENT_TYPES.resizeHandle, NODE_ELEMENT_TYPES.background],
  //   buttons: BUTTONS.leftRight,
  // },

  {
    actionName: pointerActionNames.NodeScaleWheel,
    element: [...nodeEverywhere, NODE_ELEMENT_TYPES.resizeHandle],
    buttons: BUTTONS.none,
  },
  {
    actionName: pointerActionNames.NodeMoveWheel,
    element: [NODE_ELEMENT_TYPES.background],
  },

  {
    actionName: pointerActionNames.NodeDownloadFile,
    element: [NODE_ELEMENT_TYPES.downloadHandle],
  },

  {
    actionName: pointerActionNames.NodeEditEnd,
    element: [NODE_ELEMENT_TYPES.headerHandle, NODE_ELEMENT_TYPES.text],
    type: POINTER_PRESS_TYPES.normal,
  },
  // this causes the problem, that nodes with mostly text cannot be zoomed to, as this catches the dbl click
  // after the first is selecting the card
  // {
  //   actionName: pointerActionNames.NodeEditSelectAll,
  //   element: [NODE_ELEMENT_TYPES.headerHandle],
  //   type: POINTER_PRESS_TYPES.double,
  // },
  {
    actionName: pointerActionNames.NodeEditSelectAll,
    element: [NODE_ELEMENT_TYPES.text],
    type: POINTER_PRESS_TYPES.long,
  },
  {
    actionName: pointerActionNames.NodeTextHover,
    element: [NODE_ELEMENT_TYPES.text],
    buttons: BUTTONS.none,
  },
  // {
  //   actionName: pointerActionNames.NodeEditHover,
  //   element: [NODE_ELEMENT_TYPES.text],
  //   buttons: BUTTONS.none,
  // },

  {
    actionName: pointerActionNames.NodeAddResize,
    element: nodeEverywhere,
    mode: EDIT_MODES.addNode,
  },
  {
    actionName: pointerActionNames.NodeAddHover,
    element: nodeEverywhere,
    mode: EDIT_MODES.addNode,
    buttons: BUTTONS.none,
  },
  {
    actionName: pointerActionNames.NodeAddClick,
    element: nodeEverywhere,
    mode: EDIT_MODES.addNode,
  },

  {
    actionName: pointerActionNames.GhostMaterialize,
    element: GHOST_ELEMENT_TYPES.create,
  },
  // disabled for the new color scheme
  // {
  //   actionName: pointerActionNames.GhostHighlight,
  //   element: GHOST_ELEMENT_TYPES.create,
  //   buttons: BUTTONS.none,
  //   mode: [EDIT_MODES.navigate, EDIT_MODES.addNode],
  // },
  {
    actionName: pointerActionNames.GhostExpand,
    element: GHOST_ELEMENT_TYPES.expand,
    type: POINTER_PRESS_TYPES.normal,
  },

  {
    actionName: pointerActionNames.EdgeAddClick,
    element: nodeEverywhere,
    mode: EDIT_MODES.addEdge,
  },
  {
    actionName: pointerActionNames.EdgeAddHover,
    element: nodeEverywhere,
    mode: EDIT_MODES.addEdge,
    buttons: BUTTONS.none,
  },
  {
    actionName: pointerActionNames.EdgeSelect,
    element: edgeEverywhere,
  },
  {
    actionName: pointerActionNames.EdgeZoomTo,
    element: [EDGE_ELEMENT_TYPES.line, EDGE_ELEMENT_TYPES.arrow],
    type: POINTER_PRESS_TYPES.double,
  },

  {
    actionName: pointerActionNames.EdgeEdit,
    element: [EDGE_ELEMENT_TYPES.text],
    type: POINTER_PRESS_TYPES.double,
  },
  {
    actionName: pointerActionNames.EdgeEdit,
    element: [EDGE_ELEMENT_TYPES.text],
    type: POINTER_PRESS_TYPES.long,
  },
]

export default DEFAULT_BINDINGS
