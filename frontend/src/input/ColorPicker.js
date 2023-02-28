import React from 'react'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import CheckIcon from '@material-ui/icons/Check'
import makeStyles from '@material-ui/styles/makeStyles'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import CONFIG from '../engine/CONFIG'
import parseColor from '../engine/utils/parseColor'
import {center} from '../styles/styles'

const {colors} = CONFIG.nodes.tags

const useStyles = makeStyles(theme => ({
  chip: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    width: '5em',
    height: '3em',
  },
  check: {
    ...center,
  },
  container: {
    marginLeft: -theme.spacing(1.5),
    width: '18em',
  },
  button: {
    padding: 0,
  },
}))

const ColorPicker = ({value, onChange, justifyContent = 'center'}) => {
  const classes = useStyles()

  return (
    <Grid container className={classes.container} spacing={1} justifyContent={justifyContent}>
      {colors.map(rawColorName => {
        const colorName = `@${rawColorName}`
        const color = parseColor(colorName)

        return (
          <Grid key={colorName} item>
            <Button className={classes.button} onClick={() => onChange(colorName)} fullWidth>
              <Paper
                className={classes.chip}
                component={Box}
                color={color.text.hex()}
                bgcolor={color.background.hex()}
                elevation={1}
              >
                {colorName === value ? <CheckIcon className={classes.check} /> : null}
              </Paper>
            </Button>
          </Grid>
        )
      })}
    </Grid>
  )
}

export default ColorPicker
