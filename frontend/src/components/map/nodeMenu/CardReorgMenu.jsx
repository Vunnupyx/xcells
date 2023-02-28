import React from 'react'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import DashBoard from '@material-ui/icons/Dashboard'
import Reorder from '@material-ui/icons/Reorder'
import ViewComfy from '@material-ui/icons/ViewComfy'
import FavoriteBorder from '@material-ui/icons/FavoriteBorder'
import CircleOutlined from '@material-ui/icons/RadioButtonUncheckedOutlined'
import AllInclusiveOutlined from '@material-ui/icons/AllInclusiveOutlined'
import {FormattedMessage} from 'react-intl'

import InfinityTraversal from '../../../engine/reorg-algorithm/InfinityTraversal'
import StackPacker from '../../../engine/reorg-algorithm/cardpacker-implementations/BoxPacker/StackPacker'
import GridPacker from '../../../engine/reorg-algorithm/cardpacker-implementations/GridPacker'

import CurvePacker from '../../../engine/reorg-algorithm/cardpacker-implementations/CurvePacker/CurvePacker'
import CircleCurve from '../../../engine/reorg-algorithm/cardpacker-implementations/CurvePacker/CircleCurve'
import HeartCurve from '../../../engine/reorg-algorithm/cardpacker-implementations/CurvePacker/HeartCurve'
import InfinityCurve from '../../../engine/reorg-algorithm/cardpacker-implementations/CurvePacker/InfinityCurve'
import {track} from '../../../contexts/tracking'

const CARD_REORG_MENU_LIST = [
  {
    // Compact
    icon: <DashBoard />,
    textId: 'toolbarMenuReorgCompactDirect',
    packer: new StackPacker(),
    depth: 1,
  },
  {
    // Compact (deep)
    icon: undefined,
    textId: 'toolbarMenuReorgCompactAll',
    packer: new StackPacker(),
    depth: InfinityTraversal.INFINITE_DEPTH,
  },
  {
    // List
    icon: <Reorder />,
    textId: 'toolbarMenuReorgListDirect',
    packer: new StackPacker(Number.MIN_VALUE),
    depth: 1,
  },
  {
    // List (deep)
    icon: undefined,
    textId: 'toolbarMenuReorgListAll',
    packer: new StackPacker(Number.MIN_VALUE),
    depth: InfinityTraversal.INFINITE_DEPTH,
  },
  {
    // Grid
    icon: <ViewComfy />,
    textId: 'toolbarMenuReorgGridDirect',
    packer: new GridPacker(),
    depth: 1,
  },
  {
    // Grid (deep)
    icon: undefined,
    textId: 'toolbarMenuReorgGridAll',
    packer: new GridPacker(),
    depth: InfinityTraversal.INFINITE_DEPTH,
  },
  {
    // Circle
    icon: <CircleOutlined />,
    textId: 'toolbarMenuReorgCircle',
    packer: new CurvePacker(new CircleCurve()),
    depth: 1,
  },
  {
    // Heart
    icon: <FavoriteBorder />,
    textId: 'toolbarMenuReorgHeart',
    packer: new CurvePacker(new HeartCurve()),
    depth: 1,
  },
  {
    // Infinity
    icon: <AllInclusiveOutlined />,
    textId: 'toolbarMenuReorgInfinity',
    packer: new CurvePacker(new InfinityCurve()),
    depth: 1,
  },
]

function CardReorgMenuItem(props) {
  const {icon, textId, packer, depth, styleclass, executePacker} = props
  return (
    <MenuItem
      className={styleclass}
      onClick={() => {
        track({
          action: 'reorganize',
          details: {method: 'nodeToolbar', reorgBy: textId.substring('toolbarMenuReorg'.length)},
        })
        executePacker(packer, depth)
      }}
      style={{
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 6,
        paddingBottom: 6,
      }}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <FormattedMessage id={textId} />
    </MenuItem>
  )
}

export default function CardReorgMenu(props) {
  const {handleClose, reorgNodes, itemStyleClass} = props
  const executePacker = (packer /* ICardPacker */, depth /* number */) => {
    handleClose()
    reorgNodes(depth, packer)
  }

  return (
    <MenuList>
      {CARD_REORG_MENU_LIST.map(({icon, textId, packer, depth}) => (
        <CardReorgMenuItem
          key={`card-reorg-menu-${textId}`}
          icon={icon}
          textId={textId}
          packer={packer}
          depth={depth}
          styleclass={itemStyleClass}
          executePacker={executePacker}
        />
      ))}
    </MenuList>
  )
}
