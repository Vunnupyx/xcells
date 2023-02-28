import React, {useState} from 'react'
import {FormattedMessage} from 'react-intl'

import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import Star from '@material-ui/icons/Star'
import FitnessCenter from '@material-ui/icons/FitnessCenter'
import List from '@material-ui/core/List'
import Switch from '@material-ui/core/Switch'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItem from '@material-ui/core/ListItem'
import Collapse from '@material-ui/core/Collapse'
import makeStyles from '@material-ui/styles/makeStyles'
import {useDevModeContext} from '../../../hooks/useDevMode'

// Style for the submenu
const useStyles = makeStyles(() => ({
  nested: {
    paddingLeft: 30,
  },
  nestednested: {
    paddingLeft: 60,
  },
  nestedCollapse: {
    paddingLeft: 40,
  },
}))

const createToggle = (setState, state) => event => {
  // TODO: use function again, when fixed in react-use, e.g. https://github.com/streamich/react-use/pull/1438
  // setState(s => !s)
  setState(!state)
  event.stopPropagation()
}

/**
 * Dev mode submenu for a react <List>
 *
 * @returns {JSX.Element}
 */
const DevModeMenu = () => {
  const classes = useStyles()

  const [open, setOpen] = useState(false)
  const devmodeClick = createToggle(setOpen, open)

  const [openBenchmark, setOpenBenchmark] = useState(false)
  const openBenchmarkClick = createToggle(setOpenBenchmark, openBenchmark)

  const {debugLogsActive, setDebugLogsActive} = useDevModeContext()
  const toggleDebugLogsActive = createToggle(setDebugLogsActive, debugLogsActive)

  const {floodLogsActive, setFloodLogsActive} = useDevModeContext()
  const toggleFloodLogsActive = createToggle(setFloodLogsActive, floodLogsActive)

  const {performanceLogsActive, setPerformanceLogsActive} = useDevModeContext()
  const togglePerformanceLogsActive = createToggle(setPerformanceLogsActive, performanceLogsActive)

  const {mapStatsVisible, setMapStatsVisible} = useDevModeContext()
  const toggleMapStatsVisible = createToggle(setMapStatsVisible, mapStatsVisible)

  const {fpsCounterVisible, setFpsCounterVisible} = useDevModeContext()
  const toggleFpsCounterVisible = createToggle(setFpsCounterVisible, fpsCounterVisible)

  const {systemInformationVisible, setSystemInformationVisible} = useDevModeContext()
  const toggleSystemInformationVisible = createToggle(setSystemInformationVisible, systemInformationVisible)

  const {fpsTickerRun, setFpsTickerRun} = useDevModeContext()
  const toggleFpsTickerStop = createToggle(setFpsTickerRun, fpsTickerRun)

  const {setNodeJumpVisible, nodeJumpVisible} = useDevModeContext()
  const toggleNodeJumpVisible = createToggle(setNodeJumpVisible, nodeJumpVisible)

  const {circleBenchmarkVisible, setCircleBenchmarkVisible} = useDevModeContext()
  const toggleCircleBenchmarkVisible = createToggle(setCircleBenchmarkVisible, circleBenchmarkVisible)

  const {showMetrics, setShowMetrics} = useDevModeContext()
  const toggleShowMetrics = createToggle(setShowMetrics, showMetrics)

  return (
    <>
      <ListItem button onClick={devmodeClick}>
        <ListItemIcon>
          <Star />
        </ListItemIcon>
        <ListItemText>
          <FormattedMessage id="devModeMenuLabel" />
        </ListItemText>
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem button className={classes.nested} onClick={toggleDebugLogsActive}>
            <Switch checked={debugLogsActive} />
            <ListItemText>
              <FormattedMessage id="devModeMenuDebugLogsLabel" />
            </ListItemText>
          </ListItem>
          <ListItem button className={classes.nested} onClick={toggleFloodLogsActive}>
            <Switch checked={floodLogsActive} />
            <ListItemText>
              <FormattedMessage id="devModeMenuFloodLogsLabel" />
            </ListItemText>
          </ListItem>
          <ListItem button className={classes.nested} onClick={togglePerformanceLogsActive}>
            <Switch checked={performanceLogsActive} />
            <ListItemText>
              <FormattedMessage id="devModeMenuPerformanceLogsLabel" />
            </ListItemText>
          </ListItem>
          <ListItem button className={classes.nested} onClick={toggleMapStatsVisible}>
            <Switch checked={mapStatsVisible} />
            <ListItemText>
              <FormattedMessage id="devModeMenuMapStatsLabel" />
            </ListItemText>
          </ListItem>
          <ListItem button className={classes.nested} onClick={toggleFpsCounterVisible}>
            <Switch checked={fpsCounterVisible} />
            <ListItemText>
              <FormattedMessage id="devModeMenuFpsCounterLabel" />
            </ListItemText>
          </ListItem>
          <ListItem button className={classes.nested} onClick={toggleSystemInformationVisible}>
            <Switch checked={systemInformationVisible} />
            <ListItemText>
              <FormattedMessage id="devModeMenuSystemInformationLabel" />
            </ListItemText>
          </ListItem>
          <ListItem button className={classes.nestedCollapse} onClick={openBenchmarkClick}>
            <ListItemIcon>
              <FitnessCenter />
            </ListItemIcon>
            <ListItemText>
              <FormattedMessage id="devModeBenchmarkMenuLabel" />
            </ListItemText>
            {openBenchmark ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openBenchmark} timeout="auto" unmountOnExit>
            <ListItem button className={classes.nestednested} onClick={toggleShowMetrics}>
              <Switch checked={showMetrics} />
              <ListItemText>
                <FormattedMessage id="devModeMenuShowMetricsLabel" />
              </ListItemText>
            </ListItem>
            <ListItem button className={classes.nestednested} onClick={toggleFpsTickerStop}>
              <Switch checked={fpsTickerRun} />
              <ListItemText>
                <FormattedMessage id="devModeMenuFpsTickerRunLabel" />
              </ListItemText>
            </ListItem>
            <ListItem button className={classes.nestednested} onClick={toggleNodeJumpVisible}>
              <Switch checked={nodeJumpVisible} />
              <ListItemText>
                <FormattedMessage id="devModeNodeJumpLabel" />
              </ListItemText>
            </ListItem>
            <ListItem button className={classes.nestednested} onClick={toggleCircleBenchmarkVisible}>
              <Switch checked={circleBenchmarkVisible} />
              <ListItemText>
                <FormattedMessage id="devModeCircleBenchmarkLabel" />
              </ListItemText>
            </ListItem>
          </Collapse>
        </List>
      </Collapse>
    </>
  )
}

export default DevModeMenu
