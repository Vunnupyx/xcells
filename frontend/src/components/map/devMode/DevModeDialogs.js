import React from 'react'
import {FormattedMessage} from 'react-intl'
import {useParams} from 'react-router-dom'

import makeStyles from '@material-ui/styles/makeStyles'
import Grid from '@material-ui/core/Grid'

import {useDevModeContext} from '../../../hooks/useDevMode'
import DevModeDialog from './DevModeDialog'
import SystemInformation from './SystemInformation'
import {CurrentFps, LastAnimationFps} from './DevModeFps'
import NodeJump from './DevModeNodeJump'
import CircleBenchmark from './DevModeCircleBenchmark'
import ViewportStats from './ViewportStats'
import DurationMetrics from './DurationMetrics'
import {
  CIRCLE_BENCHMARK_END_NODE,
  CIRCLE_BENCHMARK_ITERATIONS,
  CIRCLE_BENCHMARK_START_NODE,
} from '../../../utils/urlFlags'
import MapStats from './MapStats'

const useStyles = makeStyles(theme => ({
  container: {
    top: 0,
    left: 0,
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: theme.spacing(1),
  },
}))

/**
 * Renders dev mode information
 *
 * @returns {JSX.Element}
 */
const DevModeDialogs = () => {
  // Map stats
  const {
    mapStatsVisible,
    setMapStatsVisible,
    systemInformationVisible,
    setSystemInformationVisible,
    fpsCounterVisible,
    setFpsCounterVisible,
    nodeJumpVisible,
    setNodeJumpVisible,
    circleBenchmarkVisible,
    setCircleBenchmarkVisible,
    showMetrics,
    setShowMetrics,
  } = useDevModeContext()

  const classes = useStyles()

  const {
    [CIRCLE_BENCHMARK_START_NODE]: startNodeParam,
    [CIRCLE_BENCHMARK_END_NODE]: endNodeParam,
    [CIRCLE_BENCHMARK_ITERATIONS]: iterationsParam,
  } = useParams()

  const benchmarkAutorun = Boolean(startNodeParam && endNodeParam && iterationsParam)

  return (
    <Grid container className={classes.container}>
      {mapStatsVisible ? (
        <DevModeDialog hide={() => setMapStatsVisible(false)} width={140}>
          <MapStats />
          <ViewportStats />
        </DevModeDialog>
      ) : null}

      {fpsCounterVisible ? (
        <DevModeDialog hide={() => setFpsCounterVisible(false)} width={180}>
          <CurrentFps />
          <p />
          <Grid container spacing={1}>
            <Grid item>
              <FormattedMessage id="devModeDialogFpsAnimationLabel" />
              {': '}
            </Grid>
            <Grid item>
              <LastAnimationFps />
            </Grid>
          </Grid>
        </DevModeDialog>
      ) : null}

      {systemInformationVisible ? (
        <DevModeDialog hide={() => setSystemInformationVisible(false)} width={200}>
          <SystemInformation />
        </DevModeDialog>
      ) : null}

      {nodeJumpVisible ? (
        <DevModeDialog hide={() => setNodeJumpVisible(false)} width={200}>
          <NodeJump />
        </DevModeDialog>
      ) : null}

      {circleBenchmarkVisible || benchmarkAutorun ? (
        <DevModeDialog hide={() => setCircleBenchmarkVisible(false)} width={200}>
          <CircleBenchmark />
        </DevModeDialog>
      ) : null}

      {showMetrics ? (
        <DevModeDialog hide={() => setShowMetrics(false)} width={280}>
          <DurationMetrics />
        </DevModeDialog>
      ) : null}
    </Grid>
  )
}

export default DevModeDialogs
