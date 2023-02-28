import {add, edit} from '../../../store/actions'
import px from '../../utils/px'
import CommonTextField from '../CommonTextField'
import type PixiNode from '../../PixiNode'
import parseColor from '../../utils/parseColor'
import CONFIG from '../../CONFIG'
import {track} from '../../../contexts/tracking'

class NodeTextField extends CommonTextField {
  node: PixiNode

  constructor(node: PixiNode) {
    super(node, node.engine.textFieldNodes)
    this.node = node
  }

  moveTextField = (): void => {
    const {textFieldMask, textField, node} = this
    const {parentNode, depth, elements} = this.node

    if (!textFieldMask || !textField) return

    const {text: style, borderSize, gridSize} = CONFIG.nodes
    const {width: originalTextWidth, height: originalTextHeight} = elements.elements.text || {
      width: 0,
      height: gridSize,
    }

    const {x: parentPositionX, y: parentPositionY} = parentNode.getGlobalPosition()
    const {x: childX, y: childY} = node.getGlobalPosition()
    const parentScale = parentNode.parentNode.elements.childrenContainer.worldTransform.a
    const parentWidth = parentNode.width * parentScale - 2 * borderSize * parentScale
    const parentHeight = parentNode.height * parentScale - 2 * borderSize * parentScale
    const parentX = parentPositionX + borderSize * parentScale
    const parentY = parentPositionY + borderSize * parentScale
    const scale = parentNode.elements.childrenContainer.worldTransform.a
    const x = childX + style.paddingLeft * scale
    const y = childY + (style.paddingTop + style.xCorrection) * scale
    const textWidth = (originalTextWidth + style.textFieldGrow) * scale
    const textHeight = originalTextHeight * scale

    const maskLeft = Math.max(parentX, x)
    const maskTop = Math.max(parentY, y)
    const maskWidth = textWidth - Math.max(parentX - x, 0) - Math.max(x + textWidth - parentX - parentWidth, 0)
    const maskHeight = textHeight - Math.max(parentY - y, 0) - Math.max(y + textHeight - parentY - parentHeight, 0)

    const left = px(Math.min(0, x - parentX))
    const top = px(Math.min(0, y - parentY))
    const width = px(textWidth)

    this.logFlood('move text field')

    const textColor = parseColor(node.getColorName()).text

    Object.entries({
      left: px(maskLeft),
      top: px(maskTop),
      position: 'absolute',
      width: px(maskWidth),
      height: px(maskHeight),
      overflow: 'hidden',
      // outline, for debugging
      // border: '1px solid red',
      // margin: '-1px',
      // boxSizing: 'content-box',
    }).forEach(([name, value]) => {
      // @ts-ignore not sure what the problem here is
      textFieldMask.style[name] = value
    })

    Object.entries({
      top,
      left,
      width,
      fontSize: px((Math.round(style.size * style.scale) / style.scale) * scale),
      fontFamily: style.fontFamily,
      fontWeight: `${style.fontWeight}`,
      letterSpacing: '0',
      overflowWrap: 'anywhere',
      lineHeight: `${style.lineHeight * style.lineHeightCorrection}`,
      color: textColor.hex(),
      position: 'absolute',
      display: 'inline-block',
      background: 'transparent',
      // outline, for debugging
      // border: '1px solid black',
      // margin: '-1px',
      // boxSizing: 'content-box',
      zIndex: depth.toString(),
    }).forEach(([name, value]) => {
      // @ts-ignore not sure what the problem here is
      textField.style[name] = value
    })
  }

  saveTextField = (): void => {
    const {node} = this
    const {
      engine: {eventManager},
      storeNode: {title: storeNodeTitle},
      title,
      _title,
      state,
    } = this.node
    const {selectedNodes} = this.node.engine.eventManager

    this.log('saveTitle', {title, _title, storeNodeTitle, selectedNodes})
    if (_title != null && _title?.length > 0) track({action: 'nodeEdit', details: {textSize: title?.length}})

    // save only when the text was changed and a value is given or existed before
    if (title !== storeNodeTitle && (title || storeNodeTitle)) {
      const actions = []
      if (state.isTemporary) actions.push(add(node))
      actions.push(edit(node))
      eventManager.addDispatch(actions)
      eventManager.commitDispatches()
    }
    eventManager.makeNodeVisibleIfNecessary(node)
  }
}

export default NodeTextField
