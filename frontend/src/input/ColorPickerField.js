import React from 'react'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/styles/makeStyles'
import ColorPicker from './ColorPicker'

const useStyle = makeStyles(theme => ({
  error: {
    marginTop: theme.spacing(0.5),
  },
}))

const ColorPickerField = ({input, meta, ...rest}) => {
  const classes = useStyle()
  return (
    <div>
      <ColorPicker {...input} {...rest} />
      {meta.touched && meta.error ? (
        <Typography className={classes.error} color="error" variant="caption" component="p">
          {meta.error}
        </Typography>
      ) : null}
    </div>
  )
}

export default ColorPickerField
