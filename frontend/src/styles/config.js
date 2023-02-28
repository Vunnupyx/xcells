import {createContext, useContext} from 'react'
// Global style config for https://www.styled-components.com
// and Material UI themes https://material-ui.com/customization
// This config can be accessed in all style-components via "props.theme".
import engineConfig from '../engine/CONFIG'

const config = {
  ...engineConfig,
  mui: {
    // See https://material-ui.com/customization/themes/#palette
    palette: {
      background: {
        default: '#edf3fa',
        blue: '#3b6a99',
        blue100: '#4e8dcc',
        blue5: '#f6f9fc',

        green: '#41765f',
        green100: '#569d7e',
        green5: '#f6faf8',

        lachs: '#b58b83',
        lachs100: '#e4afa5',
        lachs10: '#fcf7f6',
        lachs5: '#fefbfb',

        lila: '#544068',
        lila100: '#664e7e',
        lila5: '#f7f6f9',

        grauBlue: '#293240',
        grauBlue100: '#364355',
        grauBlue80: '#5e6977',
        grauBlue60: '#9aa1aa',
        grauBlue40: '#afb4bb',
        grauBlue5: '#f5f6f6',
      },
      text: {
        primary: '#5E6977',
        secondary: '#AFB4BB',
      },
      primary: {
        main: '#569d7e',
      },
      secondary: {
        main: '#e4afa5',
        contrastText: '#ffffff',
      },
      action: {
        active: '#5E6977',
      },
    },
    shape: {
      borderRadius: 18,
    },

    // See https://material-ui.com/customization/themes/#css
    overrides: {
      MuiButton: {
        contained: {
          textTransform: 'none',
        },
        outlined: {
          textTransform: 'none',
        },
      },
    },
  },
}

export const ConfigContext = createContext()

export const useConfig = () => useContext(ConfigContext)

export default config
