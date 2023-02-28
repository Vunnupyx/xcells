import React from 'react'
import ListItem from '@material-ui/core/ListItem'
import Link from './Link'

const ListItemLink = props => <ListItem button component={Link} {...props} />

export default ListItemLink
