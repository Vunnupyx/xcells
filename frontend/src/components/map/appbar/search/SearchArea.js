import React, {useCallback, useEffect, useMemo, useState} from 'react'
import debug from 'debug'
import clsx from 'clsx'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Divider from '@material-ui/core/Divider'
import SearchField from './SearchField'
import useEngine from '../../../engine/useEngine'
import SearchResult from './SearchResult'
import TitleOrTagFilter from './filter/DefaultFilter'
import TagFilter from './filter/TagFilter'
import TitleFilter from './filter/TitleFilter'
import ColorFilter from './filter/ColorFilter'
import BorderColorFilter from './filter/BorderColorFilter'
import TodoFilter from './filter/TodoFilter'
import ImageFilter from './filter/ImageFilter'
import FileFilter from './filter/FileFilter'
import CONFIG from '../../../../engine/CONFIG'

const log = debug('app:MapSearch')

const DIV_WIDTH = 320
const DIV_MARGIN = 16
const LIST_PADDING = 8
const TOOLBAR_PADDING = 4
const TOOLBAR_MARGIN = 8
const ZOOM_PADDING_RIGHT = DIV_WIDTH + 2 * (DIV_MARGIN + LIST_PADDING + TOOLBAR_PADDING) + TOOLBAR_MARGIN

const useStyles = makeStyles(theme => ({
  searchArea: {
    paddingTop: 4,
    display: 'flex',
    flexFlow: 'column',
    height: '100%',
    width: '100%',
  },
  fillHeight: {
    flexGrow: 1,
  },
  list: {
    padding: theme.spacing(0),
    margin: theme.spacing(1),
    width: DIV_WIDTH,
  },
  maxHeightToScreen: {
    maxHeight: window.innerHeight - 56 - 16,
  },
  scrollY: {
    overflowY: 'overlay',
    overflowX: 'hidden',
  },
  active: {
    boxShadow: '0px 0px 2px 1px lightGray',
  },
}))

const SearchArea = ({setSearchVisible}) => {
  const classes = useStyles()
  const engine = useEngine(false)
  const {renderNodes} = engine

  const [selectedIndex, setSelectedIndex] = useState(-1)

  const [filterInstances, setFiltersInstances] = useState([[new TitleFilter(), '']])
  const filterTypes = useState([
    new TagFilter(),
    new TitleFilter(),
    new ColorFilter(),
    new BorderColorFilter(),
    new TodoFilter(),
    new ImageFilter(),
    new FileFilter(),
  ])[0]
  const defaultFilter = useState(new TitleOrTagFilter())[0]

  useEffect(() => {
    filterTypes.forEach(ft => ft.init(engine))
    defaultFilter.init(engine)
  }, [defaultFilter, engine, filterTypes])

  log(filterInstances)

  const focusNode = useCallback(
    node => {
      log('onChange', node)
      const zoomPadding = {
        ...CONFIG.nodes.zoomToNodePadding,
        right: ZOOM_PADDING_RIGHT,
      }
      engine.eventManager.selectSingleNode(node)
      const zoomNode = node.parentNode && !node.parentNode.isRoot ? node.parentNode : node
      engine.control.zoomToNode(zoomNode, zoomPadding)
    },
    [engine],
  )

  const onSearchChanged = useCallback(() => {
    setSelectedIndex(-1)
  }, [setSelectedIndex])

  const searchNodes = useMemo(() => {
    if (filterInstances.length === 1 && filterInstances[0][1] === '') return []
    return Object.values(renderNodes)
      .filter(node => node.title?.trim() && !node.isRoot)
      .filter(node => filterInstances.every(([filterType, term]) => filterType.filter(term, node)))
      .sort((n1, n2) => (n1.title?.trim().toLowerCase() < n2.title?.trim().toLowerCase() ? -1 : 1))
      .splice(0, 50)
  }, [filterInstances, renderNodes])

  const onKeyDown = useCallback(
    event => {
      const {key} = event
      if (key === 'ArrowDown') {
        setSelectedIndex(i => {
          const nextValue = Math.min(searchNodes.length - 1, i + 1)
          if (searchNodes[nextValue]) {
            focusNode(searchNodes[nextValue])
          }
          return nextValue
        })
      } else if (key === 'ArrowUp') {
        setSelectedIndex(i => {
          const nextValue = Math.max(0, i - 1)
          if (searchNodes[nextValue]) {
            focusNode(searchNodes[nextValue])
          }
          return nextValue
        })
      }
    },
    [setSelectedIndex, focusNode, searchNodes],
  )

  return (
    <div className={clsx(classes.searchArea, classes.maxHeightToScreen)}>
      <div>
        <SearchField
          setSearchVisible={setSearchVisible}
          setFilterInstances={setFiltersInstances}
          filterTypes={filterTypes}
          defaultFilterType={defaultFilter}
          onSearchChanged={onSearchChanged}
          onUpDownKey={onKeyDown}
        />
      </div>
      <div className={clsx(classes.fillHeight, classes.scrollY)}>
        <List className={classes.list}>
          <Divider />
          {searchNodes.map((node, index) => (
            <>
              <ListItem
                key={node.id}
                button
                onClick={() => {
                  setSelectedIndex(index)
                  focusNode(node)
                }}
                className={index === selectedIndex ? classes.active : null}
                onKeyDown={onKeyDown}
              >
                <SearchResult node={node} />
              </ListItem>
              <Divider />
            </>
          ))}
        </List>
      </div>
    </div>
  )
}

export default SearchArea
