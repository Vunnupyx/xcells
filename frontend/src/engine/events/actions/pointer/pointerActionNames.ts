import * as actions from './index'

const pointerActionNames = Object.fromEntries(Object.keys(actions).map(name => [name, name])) as Record<
  keyof typeof actions,
  keyof typeof actions
>

export default pointerActionNames
