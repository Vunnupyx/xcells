import React from 'react'
import PropTypes from 'prop-types'
import {FormattedMessage} from 'react-intl'

import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'

import infinitySpinner from '../assets/spinner.apng'
import CONFIG from '../engine/CONFIG'

const ProgressModal = ({circular, size, thickness, children}) => {
  return (
    <Grid
      container
      direction="column"
      className="progressSpinner"
      alignItems="center"
      justifyContent="center"
      component={Box}
      height="100%"
      minHeight="50vh"
    >
      <Grid item>
        {circular ? (
          <CircularProgress size={size + 4 * (thickness / 100) * size} thickness={thickness} />
        ) : (
          <img width={size} src={infinitySpinner} alt="Loading ..." />
        )}
      </Grid>
      <Grid item>{children || <FormattedMessage id="progressIsLoading" />}</Grid>
    </Grid>
  )
}

ProgressModal.propTypes = {
  size: PropTypes.number,
  thickness: PropTypes.number,
  circular: PropTypes.bool,
}
ProgressModal.defaultProps = {
  size: CONFIG.spinner.size,
  thickness: CONFIG.spinner.thickness,
  circular: false,
}

export default ProgressModal
