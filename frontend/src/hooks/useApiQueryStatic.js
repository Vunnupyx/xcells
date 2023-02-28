import useApiQuery from './useApiQuery'

const useApiQueryStatic = settings => useApiQuery({cacheTime: Infinity, staleTime: Infinity, ...settings})

export default useApiQueryStatic
