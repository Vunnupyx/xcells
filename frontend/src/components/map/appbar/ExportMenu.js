import React, {useCallback} from 'react'
import {FormattedMessage} from 'react-intl'

import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Menu from '@material-ui/core/Menu'

import Typography from '@material-ui/core/Typography'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import {API_BASE_PATH} from '../../../shared/config/constants'
import {track} from '../../../contexts/tracking'
import useEngine from '../../engine/useEngine'
import indentedText from '../../../engine/utils/renderer/indentedText'
import markDown from '../../../engine/utils/renderer/markDown'

const ExportMenu = ({presentMode, setPresentMode, pathMode, setPathMode, ...props}) => {
  const {mapId, rootNode} = useEngine(false)

  const downloadIndentedText = useCallback(() => {
    const text = indentedText(rootNode).join('\n')
    const element = document.createElement('a')
    element.href = `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
    element.target = '_blank'
    element.download = `InfinityMaps-${mapId}.txt`
    element.click()
    track({action: 'mapExportIndentedText'})
  }, [rootNode, mapId])

  const downloadMarkDown = useCallback(() => {
    const text = markDown(rootNode)
    const element = document.createElement('a')
    element.href = `data:text/x-markdown;charset=utf-8,${encodeURIComponent(text)}`
    element.target = '_blank'
    element.download = `InfinityMaps-${mapId}.md`
    element.click()
    track({action: 'mapExportMarkDown'})
  }, [rootNode, mapId])

  return (
    <Menu {...props}>
      <ListItemText>
        <Typography variant="h6" align="center">
          <FormattedMessage id="menu.export.title" />
        </Typography>
      </ListItemText>
      <ListItem
        button
        component="a"
        href={`${API_BASE_PATH}/maps/${mapId}/export/zip`}
        onClick={() => track({action: 'mapExportZip'})}
        download
      >
        <ListItemIcon>ZIP</ListItemIcon>
        <ListItemText secondary={<FormattedMessage id="menu.export.zip.note" />}>
          <FormattedMessage id="menu.export.zip.title" />
        </ListItemText>
      </ListItem>
      <ListItem
        button
        component="a"
        href={`${API_BASE_PATH}/maps/${mapId}/export/json`}
        onClick={() => track({action: 'mapExportJson'})}
        download
      >
        <ListItemIcon>JSON</ListItemIcon>
        <ListItemText secondary={<FormattedMessage id="menu.export.json.note" />}>
          <FormattedMessage id="menu.export.json.title" />
        </ListItemText>
      </ListItem>
      <ListItem button onClick={downloadIndentedText}>
        <ListItemIcon>TXT</ListItemIcon>
        <ListItemText secondary={<FormattedMessage id="menu.export.text.note" />}>
          <FormattedMessage id="menu.export.text.title" />
        </ListItemText>
      </ListItem>
      <ListItem button onClick={downloadMarkDown}>
        <ListItemIcon>MD</ListItemIcon>
        <ListItemText secondary={<FormattedMessage id="menu.export.markDown.note" />}>
          <FormattedMessage id="menu.export.markDown.title" />
        </ListItemText>
      </ListItem>
    </Menu>
  )
}

ExportMenu.propTypes = Menu.propTypes

export default ExportMenu
