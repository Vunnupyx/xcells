import {useMemo} from 'react'
import useApiQuery from './useApiQuery'
import miscMapPicture from '../assets/templatePictures/Misc.svg'
import {FORMATTED_TEMPLATE_LIST} from './FORMATTED_TEMPLATE_LIST'

const createFindTemplate = templateDescription => template =>
  templateDescription.prodId === template._id ||
  templateDescription.devId === template._id ||
  templateDescription.localhostIds.find(localId => localId === template._id)

/**
 * Order the specified templates and set pictures
 */
const extractTemplates = array =>
  FORMATTED_TEMPLATE_LIST.map((templateDescription, index) => {
    const explicitTemplate = array.find(createFindTemplate(templateDescription))
    return {
      ...(explicitTemplate || array[index] || {_id: Math.random()}),
      properties: explicitTemplate ? templateDescription.properties : {},
      picture: explicitTemplate ? templateDescription.picture : miscMapPicture,
    }
  })

const useFormattedTemplateList = () => {
  const {data: templates = [], isFetching} = useApiQuery({
    url: '/templates',
    cacheTime: Infinity,
    staleTime: Infinity,
  })

  const data = useMemo(() => extractTemplates(templates), [templates])

  return useMemo(() => ({data, isFetching}), [data, isFetching])
}

export default useFormattedTemplateList
