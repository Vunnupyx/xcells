import React from 'react'
import Switch from '@material-ui/core/Switch'
import Zoom from '@material-ui/core/Zoom'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import makeStyles from '@material-ui/styles/makeStyles'
import PlayTimeSelect from './Buttons/PlayTimeSelect'

const useStyles = makeStyles(theme => ({
  root: {},
  container: {
    display: 'flex',
  },
  paper: {
    margin: theme.spacing(1),
  },
}))

export default function DialogItems({checkedAutoPlay, setCheckedAutoPlay, setPlayTime}) {
  const classes = useStyles()

  const handleChange = () => {
    setCheckedAutoPlay(prev => !prev)
  }

  return (
    <div className={classes.root}>
      <FormControlLabel control={<Switch checked={checkedAutoPlay} onChange={handleChange} />} label="Slide time" />
      <div className={classes.container}>
        <Zoom in={checkedAutoPlay}>
          <div>
            <PlayTimeSelect setPlayTime={setPlayTime} />
          </div>
        </Zoom>
      </div>
    </div>
  )
}
