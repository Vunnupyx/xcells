import React from 'react'
import PropTypes from 'prop-types'

import makeStyles from '@material-ui/styles/makeStyles'
import Drawer from '@material-ui/core/Drawer'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import Hidden from '@material-ui/core/Hidden'
import Divider from '@material-ui/core/Divider'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import IconButton from '@material-ui/core/IconButton'
import Grid from '@material-ui/core/Grid'

const useStyles = makeStyles({
  drawerListContent: {
    flex: '100%',
  },
})

const ResponsiveDrawer = ({
  children,
  open,
  onClose,
  footer,
  header,
  variant = 'temporary',
  anchor = 'right',
  ...rest
}) => {
  const {drawerListContent} = useStyles()

  const renderList = (
    <>
      <Grid item container>
        <Grid item>
          <IconButton onClick={onClose} onKeyDown={onClose}>
            <ChevronRightIcon />
          </IconButton>
        </Grid>
        {header || null}
      </Grid>
      <Grid item>
        <Divider />
      </Grid>
      <Grid item xs={12} className={drawerListContent}>
        {children}
      </Grid>
      {footer ? <Grid item>{footer}</Grid> : null}
    </>
  )

  return (
    <>
      <Hidden mdUp>
        <Drawer variant={variant} anchor={anchor} open={open} onClose={onClose} {...rest}>
          {renderList}
        </Drawer>
      </Hidden>
      <Hidden smDown>
        <SwipeableDrawer variant={variant} anchor={anchor} open={open} onClose={onClose} onOpen={() => true} {...rest}>
          {renderList}
        </SwipeableDrawer>
      </Hidden>
    </>
  )
}
ResponsiveDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default ResponsiveDrawer
