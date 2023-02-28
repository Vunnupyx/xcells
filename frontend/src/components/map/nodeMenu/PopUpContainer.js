import React, {useCallback, useRef, useState} from 'react'
import debug from 'debug'

import Box from '@material-ui/core/Box'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import ChevronRight from '@material-ui/icons/ChevronRight'
import Popper from '@material-ui/core/Popper'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import makeStyles from '@material-ui/styles/makeStyles'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'

import {hasTouchscreen, isMobile, isTablet} from '../../../utils/browserDetection'
import CONFIG from '../../../engine/CONFIG'

const log = debug('app:MapToolbar:ColorPickers')

const useStyles = makeStyles(theme => ({
  popper: {
    zIndex: theme.zIndex.modal,
  },
}))

const doNothing = () => {}

const useAnchorStyles = makeStyles(() => ({
  groupedTextHorizontal: {
    '&:not(:last-child)': {borderRight: 'none'},
  },
}))

const PopUpContainerAnchor = ({children, description, splitButton, splitButtonAction, buttonClassName, ...props}) => {
  return description.length > 0 ? (
    <MenuItem {...props}>{children}</MenuItem>
  ) : splitButton ? (
    <ButtonGroup variant="text" classes={useAnchorStyles()}>
      <Button style={{paddingRight: '5px'}} onClick={splitButtonAction} className={buttonClassName}>
        {children}
      </Button>
      <Button style={{paddingLeft: '5px'}} className={buttonClassName} {...props}>
        <ListItemIcon style={{minWidth: 0}}>
          {' '}
          <ArrowDropDownIcon fontSize="small" />
        </ListItemIcon>
      </Button>
    </ButtonGroup>
  ) : (
    <Button className={buttonClassName} {...props}>
      {children}
    </Button>
  )
}

export const PopUpContainer = ({
  Icon,
  iconStyle,
  children,
  disabled,
  open,
  setOpen: setOpenOriginal,
  description = '',
  placement = 'bottom',
  setOpenWrapped,
  splitButton = false,
  splitButtonAction = null,
  openOnlyOnClick = false,
  onClickToClose = doNothing,
  buttonClassName,
}) => {
  const {
    toolbar: {popperOpenTimeout, popperCloseTimeout},
  } = CONFIG
  const [anchorRef, setAnchorRef] = useState(null)

  const timeoutRef = useRef(null)
  const openTimeoutRef = useRef(null)
  const classes = useStyles()

  const setOpen = setOpenWrapped || setOpenOriginal

  const setOpenTimeout = useCallback(() => {
    log('set timeout', {openTimeoutRef})
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
    }
    openTimeoutRef.current = setTimeout(() => {
      setOpen(true)
    }, popperOpenTimeout)
  }, [popperOpenTimeout, setOpen])

  const clearOpenTimeout = useCallback(() => {
    log('clear timeout', {openTimeoutRef})
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }
  }, [])

  const setCloseTimeout = useCallback(() => {
    log('set timeout', {timeoutRef})
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, popperCloseTimeout)
  }, [popperCloseTimeout, setOpen])

  const clearCloseTimeout = useCallback(() => {
    log('clear timeout', {timeoutRef})
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  return (
    <>
      <PopUpContainerAnchor
        splitButton={splitButton}
        splitButtonAction={splitButtonAction}
        description={description}
        disabled={disabled}
        onClick={event => {
          if (open) {
            setOpen(false)
            onClickToClose(event)
          } else {
            if (isMobile || isTablet || hasTouchscreen || openOnlyOnClick) setAnchorRef(event.currentTarget)
            setOpen(true)
          }
        }}
        onPointerEnter={event => {
          if (!isMobile && !isTablet && !hasTouchscreen && !openOnlyOnClick) {
            setAnchorRef(event.currentTarget)
            clearCloseTimeout()
            setOpenTimeout()
          }
        }}
        onPointerLeave={() => {
          if (!isMobile && !isTablet && !hasTouchscreen && !openOnlyOnClick) {
            setCloseTimeout()
            clearOpenTimeout()
          }
        }}
        buttonClassName={buttonClassName}
      >
        {description.length > 0 ? (
          <>
            <ListItemIcon>
              {Icon === undefined ? (
                <Icon fontSize="small" />
              ) : (
                // eslint-disable-next-line react/jsx-pascal-case
                <Icon style={iconStyle} fontSize="small" />
              )}
            </ListItemIcon>
            <Box dispay="flex" flexGrow={1}>
              {description}
            </Box>
            <ListItemIcon style={{minWidth: 0}}>
              <ChevronRight fontSize="small" />
            </ListItemIcon>
          </>
        ) : // eslint-disable-next-line react/jsx-pascal-case
        Icon === undefined ? (
          <Icon />
        ) : (
          <Icon style={iconStyle} fontSize="small" />
        )}
      </PopUpContainerAnchor>
      {anchorRef ? (
        <Popper open={open} anchorEl={anchorRef} placement={placement} transition className={classes.popper}>
          {({TransitionProps}) => (
            <ClickAwayListener
              onClickAway={event => {
                setOpen(false)
                event.preventDefault()
              }}
            >
              <Grow {...TransitionProps}>
                <Paper onPointerEnter={clearCloseTimeout} onPointerLeave={setCloseTimeout}>
                  {children}
                </Paper>
              </Grow>
            </ClickAwayListener>
          )}
        </Popper>
      ) : null}
    </>
  )
}
