import React from 'react'
import Chip from '@material-ui/core/Chip'

const toReactComponentProps = props => {
  const toReactComponent = Cls => <Cls />
  return Object.keys(props).reduce((akk, key) => {
    akk[key] = toReactComponent(props[key])
    return akk
  }, {})
}

const FilterChip = ({filterInstance, ...props}) => {
  const [filterType, term] = filterInstance
  const style = {
    marginRight: 4,
    marginBottom: 4,
  }
  const filterProps = {
    ...filterType.getChipProps(term),
    ...toReactComponentProps(filterType.getChipReactProps(term)),
  }
  return <Chip style={style} {...filterProps} {...props} />
}

export default FilterChip
