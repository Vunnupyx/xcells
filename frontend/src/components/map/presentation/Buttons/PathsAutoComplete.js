import React from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'

const PathsAutoComplete = ({allPaths, setSelectedPathToPresent, eventManager}) => {
  const setSelectedPath = value => {
    setSelectedPathToPresent(value)
    if (value.nodes.length === 0) {
      return
    }
    eventManager.zoomToNode(value?.nodes[0])
  }

  return (
    <Autocomplete
      id="paths-demo"
      size="small"
      options={allPaths}
      getOptionLabel={option => option.title}
      style={{width: 300}}
      onChange={(event, value) => setSelectedPath(value)}
      renderInput={params => <TextField {...params} label="Paths" variant="standard" />}
    />
  )
}
export default PathsAutoComplete
