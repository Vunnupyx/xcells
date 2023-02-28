import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import CircularProgress from '@material-ui/core/CircularProgress'
import makeStyles from '@material-ui/styles/makeStyles'
import Backdrop from '@material-ui/core/Backdrop/Backdrop'

import {center} from '../styles/styles'
import spinnerSrc from '../assets/spinner.apng'
import {useConfig} from '../styles/config'

const useStyles = makeStyles(() => ({
  wrapper: {
    textAlign: 'center',
    ...center,
  },
  backdropRoot: {
    zIndex: 0,
  },
}))

const ProgressModal = ({children, open, size: propSize}) => {
  const {
    spinner: {circular, thickness, size: defaultSize},
  } = useConfig()
  const classes = useStyles()
  const size = propSize || defaultSize

  if (!open) return null

  return (
    <Backdrop open className={classes.backdropRoot}>
      <div className={clsx([classes.wrapper, 'progressSpinner'])}>
        <div>{children}</div>
        {circular ? (
          <CircularProgress size={size + 4 * (thickness / 100) * size} thickness={thickness} />
        ) : (
          <div>
            <img src={spinnerSrc} width={size} alt="Loading ..." />
          </div>
        )}
      </div>
    </Backdrop>
  )
}

ProgressModal.propTypes = {
  size: PropTypes.number,
}
ProgressModal.defaultProps = {
  size: undefined,
}

export default ProgressModal
