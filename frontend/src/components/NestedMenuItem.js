import React, {forwardRef, useCallback, useState} from 'react'

import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import makeStyles from '@material-ui/styles/makeStyles'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'

const useStyles = makeStyles(theme => ({
  menuItem: {
    backgroundColor: ({isSubMenuOpen}: {isSubMenuOpen: boolean}) =>
      isSubMenuOpen ? theme.palette.action.hover : 'transparent',
    minWidth: '12rem',
  },
  contentContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    paddingRight: 6,
  },
  expandIcon: {
    fontSize: 12,
  },
}))

const NestedMenuItem = ({children, subMenuItems = [], onClick, ...props}, ref) => {
  const [anchorEl, setAnchorEl] = useState()
  const isSubMenuOpen = Boolean(anchorEl)
  const classes = useStyles({isSubMenuOpen})
  const hasChildrenItems = subMenuItems.length || false
  const isLeafNode = !hasChildrenItems

  const handleMouseEnter = useCallback(
    event => {
      setAnchorEl(event.currentTarget)
    },
    [setAnchorEl],
  )

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [setAnchorEl])

  const handleClick = useCallback(
    event => {
      event.stopPropagation()
      if (isLeafNode) {
        onClick()
      }
    },
    [onClick, isLeafNode],
  )

  return (
    <MenuItem
      ref={ref}
      disableRipple
      className={classes.menuItem}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleClose}
      {...props}
    >
      <div className={classes.contentContainer}>
        <span className={classes.name}>{children}</span>
        {hasChildrenItems && <ArrowForwardIosIcon className={classes.expandIcon} />}
      </div>
      {hasChildrenItems && (
        <Menu
          // "pointerEvents: none" to prevent invisible Popover wrapper div to capture mouse events
          style={{pointerEvents: 'none'}}
          anchorEl={anchorEl}
          open={isSubMenuOpen}
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          PaperProps={{
            elevation: 4,
          }}
        >
          {/* reset pointer event here so that the menu items could receive mouse events */}
          <div style={{pointerEvents: 'auto'}}>{subMenuItems}</div>
        </Menu>
      )}
    </MenuItem>
  )
}

export default forwardRef(NestedMenuItem)
