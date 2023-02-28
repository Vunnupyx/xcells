import React from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import makeStyles from '@material-ui/styles/makeStyles'

const demoPaths = [
  {title: '1', time: 1},
  {title: '2', time: 2},
  {title: '5', time: 5},
  {title: '10', time: 10},
  {title: '20', time: 20},
  {title: '30', time: 30},
  {title: '40', time: 40},
  {title: '50', time: 50},
  {title: '60', time: 60},
  {title: '70', time: 70},
  {title: '80', time: 80},
  {title: '90', time: 90},
  {title: '100', time: 100},
  {title: '110', time: 110},
  {title: '120', time: 120},
]

const useStyles = makeStyles(theme => ({
  margin: {
    marginLeft: theme.spacing(4),
    width: 200,
  },
}))

const PlayTimeSelect = ({setPlayTime}) => {
  const classes = useStyles()

  const handleClick = value => {
    setPlayTime(Number(value))
  }

  return (
    <Autocomplete
      id="playtime-demo"
      size="small"
      options={demoPaths}
      getOptionLabel={option => option.title}
      className={classes.margin}
      onInputChange={(event, value) => handleClick(value)}
      renderInput={params => <TextField {...params} label="Autoplay seconds" variant="standard" />}
    />
  )
}
export default PlayTimeSelect
