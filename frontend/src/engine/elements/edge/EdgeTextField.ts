import Color from 'color'
import debug from 'debug'

import px from '../../utils/px'
import {addEdge, editEdge} from '../../../store/actions'
import CommonTextField from '../CommonTextField'
import type PixiEdge from '../../PixiEdge'
import parseColor from '../../utils/parseColor'
import {track} from '../../../contexts/tracking'

const log = debug('app:RenderEngine:EdgeTextField')
const logError = log.extend('ERROR*', '::')

class EdgeTextField extends CommonTextField {
  edge: PixiEdge

  constructor(edge: PixiEdge) {
    super(edge, edge.engine.textFieldEdges)
    this.edge = edge
  }

  moveTextField = (): void => {
    const {
      elements,
      engine: {
        viewport: {
          x: viewportX,
          y: viewportY,
          scale: {x: viewportScale},
        },
        config: {
          edges: {text: style, defaultColor},
        },
      },
      color: edgeColor,
    } = this.edge
    const {textField, textFieldMask, edge} = this

    if (!elements.elements.text) return

    const {width: textWidth} = elements.elements.text

    const color = Color(edgeColor ? parseColor(edgeColor).background : defaultColor).hex()

    const {dx, dy, startMiddlePoint, scale, radian} = edge.getPositions()

    const left = px(viewportX + (startMiddlePoint.x + dx / 2) * viewportScale)
    const top = px(viewportY + (startMiddlePoint.y + dy / 2) * viewportScale)
    const width = px(textWidth * viewportScale)

    this.log('move text field', {
      dx,
      dy,
      startMiddlePoint,
      textWidth,
      scale,
      style,
      viewportX,
      viewportY,
      viewportScale,
      top,
      left,
      width,
    })

    Object.entries({
      position: 'absolute',
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
      fontSize: px((Math.round(style.size * (style.scale / scale)) / (style.scale / scale)) * scale * viewportScale),
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      letterSpacing: '0',
      lineHeight: 1,
      overflow: 'hidden',
      display: 'inline-block',
      color,
      // WebkitTextStrokeColor: text.strokeColor,
      // WebkitTextStrokeWidth: node.image ? text.outlineThickness * scale : 0,
      // WebkitTextFillColor: node.isUrl ? text.linkColor : text.fillColor,
      position: 'absolute',
      background: 'transparent',
      transform: `translate(-50%, -50%) rotate(${radian}rad) translate(50%, 50%) translate(-50%, -100%)`,
      // outline, for debugging
      // border: '1px solid black',
      // margin: '-1px',
    }).forEach(([name, value]) => {
      // @ts-ignore not sure what the problem here is
      textField.style[name] = value
    })
  }

  saveTextField = (): void => {
    const {title} = this.edge
    const {title: storeEdgeTitle} = this.edge.storeEdge
    const {eventManager} = this.edge.engine
    const {selectedEdges} = this.edge.engine.eventManager

    // save only when the text was changed and a value is given or existed before
    if (title !== storeEdgeTitle && (title || storeEdgeTitle)) {
      const actions = [...selectedEdges].filter(e => e.state.isTemporary).map(e => addEdge(e))
      actions.push(
        ...[...selectedEdges].map(e => {
          e.title = title
          return editEdge(e)
        }),
      )
      eventManager.addDispatch(actions).then()
      eventManager.commitDispatches()

      this.log('saveTitle', {title, storeEdgeTitle, selectedEdges, actions})
      track({action: 'edgeEdit', details: {textSize: title?.length}})
    }
  }

  logError = (message: string, ...args: unknown[]): void => {
    const {id} = this.edge
    logError(id, message, ...args)
  }
}

export default EdgeTextField
