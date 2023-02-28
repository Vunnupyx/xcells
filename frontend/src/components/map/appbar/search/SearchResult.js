import React from 'react'
import {FormattedMessage} from 'react-intl'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import makeStyles from '@material-ui/styles/makeStyles'

const useStyles = makeStyles(theme => ({
  childChips: {
    maxWidth: '10em',
  },
  parentCrumbs: {
    maxWidth: '10em',
    padding: `0 ${theme.spacing(0.5)}px`,
  },
  container: {
    width: '100%',
    overflow: 'hidden',
    marginBottom: theme.spacing(1),
  },
}))

const BreadCrumbSeparator = () => (
  <Typography noWrap variant="caption" color="textSecondary">
    {'>'}
  </Typography>
)

const ParentBreadCrumbs = ({node, className}) =>
  node.isRoot ? (
    <BreadCrumbSeparator />
  ) : (
    <>
      <ParentBreadCrumbs node={node.parentNode} />
      <Typography className={className} noWrap variant="caption" color="textSecondary">
        {node.title || "''"}
      </Typography>
      <BreadCrumbSeparator />
    </>
  )

const SearchResult = ({node}) => {
  const {title, childNodes, offspringCount, parentNode} = node
  const classes = useStyles()

  return (
    <div className={classes.container}>
      <Grid container direction="row" wrap="nowrap">
        <ParentBreadCrumbs node={parentNode} className={classes.parentCrumbs} />
      </Grid>
      <Typography noWrap variant="h6">
        {title}
      </Typography>
      <Grid container wrap="nowrap" direction="row">
        {[...childNodes]
          .filter(n => n.title)
          .map((n, i) => (
            <Grid item key={n.id}>
              <Typography className={classes.childChips} noWrap variant="body1">
                {i !== 0 ? ' · ' : null}
                {n.title}
              </Typography>
            </Grid>
          ))}
      </Grid>
      <Grid item>
        <Typography noWrap variant="caption" align="right" color="textSecondary">
          <FormattedMessage id="search.result.directChildCount" />: {childNodes.size}
          {offspringCount === childNodes.size ? null : (
            <>
              {', '}
              <FormattedMessage id="search.result.totalChildCount" />: {offspringCount}
            </>
          )}
        </Typography>
      </Grid>
    </div>
  )
}

export default SearchResult
