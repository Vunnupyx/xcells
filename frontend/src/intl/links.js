import React from 'react'
import Link from '@material-ui/core/Link'

// eslint-disable-next-line react/display-name
const createLink = url => text => <Link href={url}>{text}</Link>

export const subscribe = createLink('https://infinitymaps.io/shop/')
export const register = createLink('https://infinitymaps.io/register/')

export const feedback = text => <Link to="/maps/feedback">{text}</Link>
