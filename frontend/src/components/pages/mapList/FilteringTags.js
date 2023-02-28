import React from 'react'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import {FormattedMessage} from 'react-intl'
import MAP_SHARE_FILTERS from './MAP_SHARE_FILTERS'

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
  }
}

const FilteringTags = ({shareFilter, setShareFilter}) => (
  <Tabs
    value={shareFilter}
    onChange={(event, newValue) => setShareFilter(newValue)}
    indicatorColor="primary"
    textColor="primary"
    variant="scrollable"
    scrollButtons="auto"
    aria-label="scrollable auto tabs filering maps visablity"
  >
    <Tab label={<FormattedMessage id="tabAll" />} {...a11yProps(0)} value={MAP_SHARE_FILTERS.all} />
    <Tab label={<FormattedMessage id="tabPrivate" />} {...a11yProps(1)} value={MAP_SHARE_FILTERS.private} />
    <Tab label={<FormattedMessage id="tabPublicUnlisted" />} {...a11yProps(2)} value={MAP_SHARE_FILTERS.hidden} />
    <Tab label={<FormattedMessage id="tabPublic" />} {...a11yProps(3)} value={MAP_SHARE_FILTERS.public} />
  </Tabs>
)
export default FilteringTags
