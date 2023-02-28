import React from 'react'
import {Helmet} from 'react-helmet'
import {FormattedMessage} from 'react-intl'

const HelmTitlePure = ({title}) => (
  <Helmet titleTemplate="%s | Infinity Maps" defaultTitle="Infinity Maps">
    <title>{title}</title>
  </Helmet>
)

const HelmetTitle = ({title, titleId}) =>
  titleId ? (
    <FormattedMessage id={titleId}>{translated => <HelmTitlePure title={translated} />}</FormattedMessage>
  ) : (
    <HelmTitlePure title={title} />
  )

export default HelmetTitle
