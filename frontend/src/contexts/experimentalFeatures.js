import {createContext, React, useEffect, useMemo} from 'react'
import {useLocalStorage} from 'react-use'

export const ExperimentalFeaturesContext = createContext()

// To access outside React
let globalAdvancedNavigation = false

export const ExperimentalFeaturesProvider = ({children}) => {
  const [advancedNavigation, setAdvancedNavigation] = useLocalStorage('experimentalAdvancedNavigation', false)

  useEffect(() => {
    globalAdvancedNavigation = advancedNavigation
  }, [advancedNavigation])

  const value = useMemo(
    () => ({
      advancedNavigation,
      setAdvancedNavigation,
    }),
    [advancedNavigation, setAdvancedNavigation],
  )

  return <ExperimentalFeaturesContext.Provider value={value}>{children}</ExperimentalFeaturesContext.Provider>
}

export const advancedNavigation = () => globalAdvancedNavigation
