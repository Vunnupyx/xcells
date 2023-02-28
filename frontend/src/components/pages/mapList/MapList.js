import React, {useMemo, useState} from 'react'
import Paper from '@material-ui/core/Paper'
import MapCard from './mapCard/MapCard'
import MapTable from './MapTable'
import useAuth from '../../../hooks/useAuth'
import MAP_SHARE_FILTERS from './MAP_SHARE_FILTERS'
import Progress from '../../Progress'
import Empty from './mapCard/Empty'
import useMapList from '../../../hooks/useMapList'

const MapList = ({view, shareFilter, searchText, isPublic}) => {
  const {isLoggedIn} = useAuth()
  const [open, setOpen] = useState(false)

  const {data, isFetching} = useMapList(isPublic)

  const filteredData = useMemo(() => {
    let filter = () => true
    if (shareFilter === MAP_SHARE_FILTERS.private) {
      filter = ({share}) => !share?.public?.enabled
    } else if (shareFilter === MAP_SHARE_FILTERS.public) {
      filter = ({share}) => share?.public?.enabled && !share.public.hidden
    } else if (shareFilter === MAP_SHARE_FILTERS.hidden) {
      filter = ({share}) => share?.public?.enabled && share.public.hidden
    }
    return (
      data &&
      data.filter(
        map =>
          filter(map) &&
          (String(map.category).toLowerCase().includes(searchText.toLowerCase()) ||
            String(map.title).toLowerCase().includes(searchText.toLowerCase())),
      )
    )
  }, [shareFilter, data, searchText])

  // Todo: infinite scroll - Paging
  // Use the state and functions returned from useTable to build your UI

  if (isFetching && !data) return <Progress />

  // this means an error while fetching data occured
  if (!data) return null

  if (isLoggedIn && data && data.length === 0) {
    return <Empty open={open} setOpen={setOpen} />
  }

  if (view === 'module') return <MapCard data={filteredData} isPublic={isPublic} isFetching={isFetching} />

  return (
    <Paper variant="outlined">
      <MapTable data={filteredData} />
    </Paper>
  )
}
export default MapList
