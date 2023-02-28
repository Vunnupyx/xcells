import useApiQuery from './useApiQuery'

const useMapList = (isPublic = false) =>
  useApiQuery({
    url: '/maps',
    query: {
      public: isPublic,
    },
  })

export default useMapList
