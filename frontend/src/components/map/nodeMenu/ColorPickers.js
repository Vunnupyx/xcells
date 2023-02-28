import React, {useCallback, useMemo, useRef} from 'react'
import {useLocalStorage} from 'react-use'
import debug from 'debug'

import capitalize from '@material-ui/core/utils/capitalize'
import makeStyles from '@material-ui/styles/makeStyles'
import MenuList from '@material-ui/core/MenuList'
import MenuItem from '@material-ui/core/MenuItem'
import Brightness1Icon from '@material-ui/icons/Brightness1'
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'
import ClearIcon from '@material-ui/icons/Clear'

import useEngine from '../../engine/useEngine'
import useEngineControl from '../../engine/useEngineControl'
import useInteractionManager from '../../engine/useInteractionManager'
import CONFIG from '../../../engine/CONFIG'
import {parsedColors} from '../../../engine/utils/parseColor'
import TransparentIcon from '../../../icons/Transparent'
import {track} from '../../../contexts/tracking'
import TooltipButton from '../toolbar/TooltipButton'
import {PopUpContainer} from './PopUpContainer'

const log = debug('app:MapToolbar:ColorPickers')

const useStyles = makeStyles(theme => ({
  listItem: {
    padding: theme.spacing(0.5),
    justifyContent: 'center',
  },
}))

const ColorPicker = ({
  open,
  setOpen,
  description = '',
  placement = 'bottom',
  verticalMenu = false,
  tooltipPrefix,
  Icon,
  transparentIcon,
  disabled,
  saveColor,
  changeColor,
  revertColor,
  openOnlyOnClick = false,
  buttonClassName,
}) => {
  const {
    colors,
    toolbar: {defaultColor, whiteColor},
  } = CONFIG

  const [colorName, setColorName] = useLocalStorage(`${tooltipPrefix}Color`, defaultColor)
  // no need for useCallback as this is used in an arrow function
  const allowHoverChangesRef = useRef(true)
  const classes = useStyles()

  const setOpenWrapped = useCallback(
    shouldOpen => {
      setOpen(shouldOpen)
      allowHoverChangesRef.current = shouldOpen
    },
    [setOpen],
  )

  const toolbarStyle = useMemo(
    () => (colorName === 'white' ? {color: whiteColor} : {color: parsedColors[colorName]?.background}),
    [colorName, whiteColor],
  )

  // Click on element in popup
  const handleMenuItemClick = useCallback(
    color => {
      log('menu click', {tooltipPrefix, color})
      setOpenWrapped(false)
      if (color) setColorName(color)
      saveColor(color)
    },
    [setOpenWrapped, setColorName, tooltipPrefix, saveColor],
  )

  // Second click on the initiation button
  const applyLastUsedColor = useCallback(() => {
    log('menu second click', colorName)
    changeColor(colorName)
  }, [changeColor, colorName])

  const ColorTooltipButton = useCallback(
    ({name}) => (
      <TooltipButton
        onClick={() => handleMenuItemClick(name)}
        onPointerEnter={() => {
          log('pointer enter', allowHoverChangesRef.current)
          if (allowHoverChangesRef.current) changeColor(name)
        }}
        titleId={`${tooltipPrefix}${capitalize(name)}`}
      >
        <Icon style={{color: name === 'white' ? whiteColor : parsedColors[name].background}} />
      </TooltipButton>
    ),
    [tooltipPrefix, Icon, whiteColor, handleMenuItemClick, changeColor],
  )

  const LightColorTooltipButton = useCallback(
    ({name}) => (
      <TooltipButton
        onClick={() => handleMenuItemClick(`${name}-light`)}
        onPointerEnter={() => {
          log('pointer enter', allowHoverChangesRef.current)
          if (allowHoverChangesRef.current) {
            changeColor(`${name}-light`)
          }
        }}
        titleId={`${tooltipPrefix}${capitalize(name)}Light`}
      >
        <Icon
          style={{
            color: name === 'white' ? whiteColor : parsedColors[`${name}-light`].background,
          }}
        />
      </TooltipButton>
    ),
    [Icon, tooltipPrefix, changeColor, whiteColor, handleMenuItemClick],
  )

  const transparentColorTooltipButton = (
    <TooltipButton
      onClick={() => handleMenuItemClick('transparent')}
      onPointerEnter={() => {
        log('pointer enter', allowHoverChangesRef.current)
        if (allowHoverChangesRef.current) changeColor('transparent')
      }}
      titleId={`${tooltipPrefix}Transparent`}
    >
      {transparentIcon}
    </TooltipButton>
  )

  const resetColorTooltipButton = (
    <TooltipButton
      onClick={() => handleMenuItemClick(undefined)}
      onPointerEnter={() => {
        log('pointer enter', allowHoverChangesRef.current)
        if (allowHoverChangesRef.current) changeColor(undefined)
      }}
      titleId={`${tooltipPrefix}Clear`}
    >
      <ClearIcon />
    </TooltipButton>
  )

  return (
    <PopUpContainer
      Icon={Icon}
      iconStyle={toolbarStyle}
      disabled={disabled}
      open={open}
      setOpen={setOpen}
      description={description}
      placement={placement}
      setOpenWrapped={setOpenWrapped}
      openOnlyOnClick={openOnlyOnClick}
      onClickToClose={applyLastUsedColor}
      buttonClassName={buttonClassName}
    >
      {verticalMenu ? (
        <MenuList>
          {Object.keys(colors)
            .filter(k => k !== 'transparent')
            .map(name => (
              <MenuItem
                key={name}
                className={classes.listItem}
                onPointerLeave={revertColor}
                style={{backgroundColor: 'transparent'}}
              >
                <ColorTooltipButton name={name} />
                <LightColorTooltipButton name={name} />
              </MenuItem>
            ))}
          {transparentColorTooltipButton}
          {resetColorTooltipButton}
        </MenuList>
      ) : (
        <MenuList>
          <MenuItem className={classes.listItem} onPointerLeave={revertColor} style={{backgroundColor: 'transparent'}}>
            {Object.keys(colors)
              .filter(k => k !== 'transparent')
              .map(name => (
                <ColorTooltipButton key={name} name={name} />
              ))}
            {transparentColorTooltipButton}
          </MenuItem>
          <MenuItem className={classes.listItem} onPointerLeave={revertColor} style={{backgroundColor: 'transparent'}}>
            {Object.keys(colors)
              .filter(k => k !== 'transparent')
              .map(name => (
                <LightColorTooltipButton key={name} name={name} />
              ))}
            {resetColorTooltipButton}
          </MenuItem>
        </MenuList>
      )}
    </PopUpContainer>
  )
}

const trackAction = (action, color, selected) => {
  const method = 'nodeToolbar'
  track({action, details: {method, color, selected}})
}

export const FillColorPicker = ({
  open,
  setOpen,
  description = '',
  placement = 'bottom',
  verticalMenu = false,
  openOnlyOnClick = false,
  buttonClassName,
}) => {
  const engine = useEngine(false)
  const control = useEngineControl()
  const {selectedNodes, selectedEdges} = useInteractionManager()

  const disabled = ![...selectedNodes].find(({isRoot}) => !isRoot) && selectedEdges.size === 0

  const handleSave = useCallback(
    color => {
      log('handle fill color saving', {color})
      trackAction('nodeSetColor', color, selectedNodes.size)
      control.setColor(color)
    },
    [control, selectedNodes],
  )

  const handleChange = useCallback(
    color => {
      log('handle fill color change', {color, selectedNodes, selectedEdges})
      ;[...selectedNodes, ...selectedEdges].forEach(obj => {
        obj.color = color ? `@${color}` : undefined
      })
      engine.scheduleRender().then()
    },
    [selectedNodes, selectedEdges, engine],
  )

  const handleRevert = useCallback(() => {
    log('handle fill revert', {selectedNodes, selectedEdges})
    ;[...selectedNodes, ...selectedEdges].forEach(obj => {
      obj.color = null
    })
    engine.scheduleRender().then()
  }, [selectedNodes, selectedEdges, engine])

  return (
    <ColorPicker
      Icon={Brightness1Icon}
      disabled={disabled}
      open={open}
      setOpen={setOpen}
      description={description}
      placement={placement}
      revertColor={handleRevert}
      changeColor={handleChange}
      setColor={control.setColor}
      saveColor={handleSave}
      tooltipPrefix="toolbarTooltipColor"
      transparentIcon={<TransparentIcon />}
      verticalMenu={verticalMenu}
      openOnlyOnClick={openOnlyOnClick}
      buttonClassName={buttonClassName}
    />
  )
}

export const BorderColorPicker = ({
  open,
  setOpen,
  description = '',
  placement = 'bottom',
  verticalMenu = false,
  openOnlyOnClick = false,
  buttonClassName,
}) => {
  const engine = useEngine(false)
  const control = useEngineControl()
  const {selectedNodes, selectedEdges} = useInteractionManager()

  const handleSave = useCallback(
    color => {
      log('handle border color saving', {color})
      trackAction('nodeSetBorderColor', color, selectedNodes.size)
      control.setBorderColor(color)
    },
    [control, selectedNodes],
  )

  const handleChange = useCallback(
    color => {
      log('handle border color change', {color, selectedNodes})
      selectedNodes.forEach(obj => {
        obj.borderColor = color ? `@${color}` : undefined
      })
      engine.scheduleRender().then()
    },
    [selectedNodes, engine],
  )

  const handleRevert = useCallback(() => {
    log('handle border revert', {selectedNodes})
    selectedNodes.forEach(node => {
      node.borderColor = null
    })
  }, [selectedNodes])

  const disabled =
    (![...selectedNodes].find(({isRoot}) => !isRoot) && selectedEdges.size === 0) || selectedNodes.size === 0

  return (
    <ColorPicker
      open={open}
      setOpen={setOpen}
      Icon={RadioButtonUncheckedIcon}
      disabled={disabled}
      description={description}
      placement={placement}
      revertColor={handleRevert}
      changeColor={handleChange}
      setColor={control.setBorderColor}
      saveColor={handleSave}
      tooltipPrefix="toolbarTooltipColor"
      transparentIcon={<TransparentIcon />}
      verticalMenu={verticalMenu}
      openOnlyOnClick={openOnlyOnClick}
      buttonClassName={buttonClassName}
    />
  )
}
