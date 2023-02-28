import React, {useCallback, useState, useMemo} from 'react'
import {useIntl} from 'react-intl'
import clsx from 'clsx'

import ListItem from '@material-ui/core/ListItem'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchIcon from '@material-ui/icons/Search'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Autocomplete from '@material-ui/lab/Autocomplete'

import FilterChip from './FilterChip'

const searchFieldInputProps = {
  startAdornment: (
    <InputAdornment position="start">
      <SearchIcon />
    </InputAdornment>
  ),
}

const useStyles = makeStyles(theme => ({
  searchTextFieldContainer: {
    display: 'flex',
    flexFlow: 'column',
    width: '100%',
    paddingTop: theme.spacing(2),
  },
  textfield: {
    padding: theme.spacing(1),
    width: 314,
  },
  fiterChip: {
    marginRight: theme.spacing(0.5),
  },
}))

const includes = input => options => options.filter(option => option.includes(input))

/**
 * @param filterTypes among all filter types there my not be two filters A and
 * B such that the title of A is a prefix of the title of B
 * @param defaultFilter may not have any options (free input)
 */
const SearchField = ({
  setSearchVisible,
  setFilterInstances,
  filterTypes,
  defaultFilterType,
  onSearchChanged,
  onUpDownKey,
}) => {
  const classes = useStyles()
  const {formatMessage} = useIntl()
  const [chips, setChips] = useState([])
  const [tfInput, setTfInput] = useState('')

  const filterBasesWithColon = useMemo(() => {
    return filterTypes.map(ft => ft.baseWithColon)
  }, [filterTypes])
  const filterTypeBasesWithOptions = useMemo(() => {
    return filterTypes.filter(ft => ft.isOptionFilter).map(ft => ft.baseWithColon)
  }, [filterTypes])
  const filterTypeBasesWithoutOptions = useMemo(() => {
    return filterTypes.filter(ft => !ft.isOptionFilter).map(ft => ft.baseWithColon)
  }, [filterTypes])

  const ensureDefaultPrefix = useCallback(
    str => (str.startsWith(defaultFilterType.baseWithColon) ? str : defaultFilterType.baseWithColon + str),
    [defaultFilterType.baseWithColon],
  )

  const chipInputToFilterInstance = useCallback(
    chipInput => {
      const filter = filterTypes.find(ft => chipInput.startsWith(ft.baseWithColon))
      if (!filter) {
        const term =
          chipInput.indexOf(defaultFilterType.base) === -1
            ? chipInput
            : chipInput.substring(defaultFilterType.baseWithColon.length)
        return [defaultFilterType, term]
      }
      const term = chipInput.substring(filter.baseWithColon.length)
      if (!filter.options) return [filter, term]
      if (!filter.getFullOptions().includes(chipInput)) return [defaultFilterType, chipInput]
      return [filter, term]
    },
    [defaultFilterType, filterTypes],
  )

  /**
   * If the variable for the 'setFilters'-useState-hook ist initialized with
   * an array that contains one subarray: [new DefaultFilter(), ''] this method
   * ensures that the array always contains at least one element, and that
   * the last element is of kind [new DefaltFilter(), <term>]
   */
  const update = useCallback(
    ({nextChips = undefined, nextTfInput = undefined}) => {
      if (nextChips === undefined && nextTfInput === undefined) return

      onSearchChanged()

      if (nextChips !== undefined) setChips(nextChips)
      if (nextTfInput !== undefined) setTfInput(nextTfInput)

      if (nextChips !== undefined && nextTfInput === undefined) {
        setFilterInstances(oldFilterInstances => {
          const tfFilter = oldFilterInstances[oldFilterInstances.length - 1]
          return nextChips.map(chipInputToFilterInstance).concat([tfFilter])
        })
        return
      }
      if (nextChips === undefined && nextTfInput !== undefined) {
        setFilterInstances(oldFilterInstances => {
          return oldFilterInstances.slice(0, -1).concat([chipInputToFilterInstance(nextTfInput)])
        })
        return
      }
      setFilterInstances(nextChips.map(chipInputToFilterInstance).concat([chipInputToFilterInstance(nextTfInput)]))
    },
    [chipInputToFilterInstance, onSearchChanged, setFilterInstances],
  )

  const onRemoveOption = useCallback(
    nextChips => {
      update({nextChips})
    },
    [update],
  )

  const onClear = useCallback(() => {
    update({
      nextChips: [],
      nextTfInput: '',
    })
  }, [update])

  const onSelectOption = useCallback(
    nextChips => {
      const last = nextChips.length - 1
      const selectedOption = nextChips[last]
      if (filterBasesWithColon.includes(selectedOption)) {
        update({
          nextChips: nextChips.splice(0, last),
          nextTfInput: selectedOption,
        })
        return
      }

      const filter = filterTypes.find(ft => selectedOption.startsWith(ft.baseWithColon))
      if (!filter) return

      const selectedSubOption = filter.getFullOptions().find(sub => selectedOption === sub)
      if (!selectedSubOption) return
      update({
        nextChips,
        nextTfInput: '',
      })
    },
    [filterBasesWithColon, filterTypes, update],
  )

  const onCreateOption = useCallback(
    nextChips => {
      const last = nextChips.length - 1
      const selectedOption = nextChips[last]
      const filter = filterTypes.find(ft => selectedOption.startsWith(ft.baseWithColon))
      if (!filter) {
        nextChips[last] = ensureDefaultPrefix(nextChips[last])
        update({
          nextChips,
          nextTfInput: '',
        })
        return
      }

      if (!filter.options) {
        update({
          nextChips,
          nextTfInput: '',
        })
        return
      }

      const selectedSubOption = filter.getFullOptions().find(sub => selectedOption === sub)
      if (!selectedSubOption) {
        nextChips[last] = ensureDefaultPrefix(nextChips[last])
      }
      update({
        nextChips,
        nextTfInput: '',
      })
    },
    [ensureDefaultPrefix, filterTypes, update],
  )
  const onChipsChanged = useCallback(
    (event, nextChips, reason) => {
      switch (reason) {
        case 'remove-option':
          onRemoveOption(nextChips)
          break
        case 'clear':
          onClear()
          break
        case 'select-option':
          onSelectOption(nextChips)
          break
        case 'create-option':
          onCreateOption(nextChips)
          break
        default:
          break
      }
    },
    [onClear, onCreateOption, onRemoveOption, onSelectOption],
  )

  const onInputChange = useCallback(
    (event, value, reason) => {
      if (reason === 'reset') return
      update({
        nextTfInput: value,
      })
    },
    [update],
  )

  const forceShowOptions = (() => {
    if (filterTypeBasesWithOptions.includes(tfInput)) return false
    if (filterTypeBasesWithoutOptions.some(base => tfInput.startsWith(base))) return false
    if (chips.length === 0 && tfInput.length === 0) return true
    if (tfInput.length === 0) return true
    if (filterTypeBasesWithOptions.some(tf => tf.startsWith(tfInput))) return true
    return false
  })()
  const openOptions = {
    openOnFocus: forceShowOptions,
    disableCloseOnSelect: forceShowOptions,
    clearOnBlur: forceShowOptions,
  }

  const getSuggestions = useCallback(
    input => {
      const base = filterBasesWithColon.find(b => input.startsWith(b))
      if (!base) {
        const isStartOfBase = filterBasesWithColon.some(b => b.includes(input))
        if (isStartOfBase) return filterBasesWithColon
        return filterTypes.map(ft => ft.getFullOptions()).flat(1)
      }
      const filter = filterTypes.find(f => f.base === base || f.baseWithColon === base)
      if (!filter) throw Error(`search filter with base "${base}" does not exist`)
      return filter.getFullOptions()
    },
    [filterBasesWithColon, filterTypes],
  )

  const onKeyDown = useCallback(
    event => {
      const {ctrlKey, key} = event
      if (key === 'Escape') {
        setSearchVisible(false)
        return
      }
      if (ctrlKey && key === 'f') {
        event.stopPropagation()
        event.preventDefault()
        update({
          nextChips: [],
          nextTfInput: '',
        })
        return
      }
      const suggestions = getSuggestions(tfInput)
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        if (
          !suggestions ||
          suggestions.every(sugg => !sugg.includes(tfInput)) ||
          (tfInput.length === 0 && chips.length > 0)
        ) {
          onUpDownKey(event)
          event.preventDefault()
          event.stopPropagation()
        }
      }
    },
    [chips.length, getSuggestions, onUpDownKey, setSearchVisible, tfInput, update],
  )

  return (
    <ListItem className={clsx(classes.searchTextFieldContainer)}>
      <Autocomplete
        value={chips}
        inputValue={tfInput}
        onInputChange={onInputChange}
        options={getSuggestions(tfInput)}
        multiple
        freeSolo
        {...openOptions}
        filterOptions={includes(tfInput)}
        onChange={onChipsChanged}
        includeInputInList
        renderTags={(value, getTagProps) =>
          value.map((chip, index) => (
            <FilterChip
              key={`search-filter-chip-${chip}`}
              filterInstance={chipInputToFilterInstance(chip)}
              {...getTagProps({index})}
            />
          ))
        }
        renderInput={params => (
          <TextField
            size="small"
            id="outlined-search"
            placeholder={formatMessage({id: 'searchForNode'})}
            width={353}
            autoFocus
            className={classes.textfield}
            onKeyDown={onKeyDown}
            value={tfInput}
            InputProps={searchFieldInputProps}
            {...params}
          />
        )}
      />
    </ListItem>
  )
}

export default SearchField
