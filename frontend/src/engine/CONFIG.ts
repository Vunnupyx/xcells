import {IMAGE_POSITIONS} from '../shared/config/constants'

const FONT_SIZE = 13
const TAG_FONT_SIZE = FONT_SIZE * (2 / 3)
const LINE_HEIGHT = 1.2
const SCALE = 2 / 3
const TEXT_PADDING_CORRECTION = 0.5
const GRID_SIZE = FONT_SIZE * LINE_HEIGHT

const CONFIG = {
  performance: {
    maximumDevicePixelRatio: 1.8,
    // distance between two zoom steps to calculate in ms
    // TODO: disabled for now, as this decreases performance
    zoomStepTimeDistance: 0,
  },

  detailLevelThresholds: {
    huge: Infinity,
    large: 20,
    normal: 2.5,
    small: 0.8,
    minimal: 0.01,
  },

  mapStoreErrorDelay: 5000,

  // border around the viewport, where the viewport moves in grow root or move mode
  mouseEdgeBorderSize: 20,
  mouseEdgeSpeed: 8,
  keyboardZoomFactor: 0.9,

  // maximum time an animation of the viewport should last
  animateDurationMax: 800,
  animateFactorMove: 0.33,
  animateFactorZoom: 8,
  animateFactor: 0.8, // how many ms per pixel
  animateFunction: 'easeOutSine', // https://easings.net/

  interaction: {
    decollapseTimeout: 800,
    turnMoveNodeTimeout: 400,
    doubleClickTimeout: 400,
    longClickLatency: 800,
    clickMoveThreshold: 5,
  },

  delay: {
    signupBox: 30000, // in ms
  },

  snackbar: {
    successDuration: 5000,
    warningDuration: 10000,
    errorDuration: 15000,
    infoDuration: 5000,
  },

  spinner: {
    circular: false, // Circular or infinity
    thickness: 2, // %
    size: 100,
  },

  upload: {
    button: {
      size: 160,
    },
  },

  header: {
    height: 0,
    padding: 0,
  },

  menu: {
    width: 250,
  },

  background: {
    // color: '#ecf1f6',
    color: '#fff',
    // dotColor: '#d6dce3',
    dotColor: '#EBECEE',
    dotRadius: 1,
    scale: 5,
  },

  toolbar: {
    tooltipDelay: 500,
    width: 140,
    borderSize: 5,
    whiteColor: '#fffaf7',
    defaultColor: 'red',
    popperOpenTimeout: 400,
    popperCloseTimeout: 400,
  },

  // old color theme
  // colors: {
  //   red: '#BB342F',
  //   orange: '#E4AFA5',
  //   yellow: '#F9CB40',
  //   green: '#569D7E',
  //   blue: '#4E8DCC',
  //   violet: '#664E7E',
  //   white: '#FBF3F1',
  //   gray: '#9AA1AA',
  //   black: '#364355',
  //   transparent: '#ffffff00',
  // },
  colors: {
    // regex: (#[A-F0-9]{6}) (#[A-F0-9]{6}) (#[A-F0-9]{6}) (#[A-F0-9]{6}) (#[A-F0-9]{6}) (#[A-F0-9]{6}) (#[A-F0-9]{6})
    // match: 100: '$1', 80: '$2', 60: '$3', 40: '$4', 20: '$5', 10: '$6', 5: '$7'
    red: {
      full: '#C3464B',
      mix: '#ffffff',
    },
    orange: {
      full: '#EB7841',
      mix: '#ffffff',
    },
    yellow: {
      full: '#FACD50',
      mix: '#ffffff',
    },
    green: {
      full: '#569D7E',
      mix: '#ffffff',
    },
    blue: {
      full: '#4E8DCC',
      mix: '#ffffff',
    },
    violet: {
      full: '#664E7E',
      mix: '#ffffff',
    },
    salmon: {
      full: '#E4AFA5',
      mix: '#ffffff',
    },
    black: {
      full: '#364355',
      mix: '#ffffff',
    },
    // disabled as not wanted by JG and HH
    // gray: {
    //   full: '#ffffff',
    //   mix: '#364355',
    // },
    white: {
      full: '#ffffff',
      mix: '#8792A1',
    },
    transparent: {
      full: '#ffffff00',
      mix: '#aaaaaa00',
    },
  },

  collaboratorColors: [
    '#569D7E',
    '#4F8DCC',
    '#F9CB40',
    '#C3464B',
    '#EB7841',
    '#E4AFA5',
    '#674E7E',
    '#364355',
    '#AFB4BB',
  ],

  nodes: {
    // percentages when a warning is shown to the user
    limitWarningPercent: [0.7, 0.95],

    // if a node is moved into a negative position and less than the threshold is visible, move it by the offset back
    outOfBorderThreshold: 5,
    outOfBorderOffset: 10,

    // when a node is ourside of this addition part of the viewport it will not be rendered
    hideOutsideViewportFactor: 0.3,

    gridSize: GRID_SIZE,
    cardSiblingSeparator: 0.75,
    childrenPaddingLeft: GRID_SIZE * (2 / 3),
    rootColor: '@white',

    // min addition to the children size as factor of gridsize
    minWidthGridAdditionFactor: 0,
    minHeightGridAdditionFactor: 0,

    ghost: {
      alphaFirst: 0.8,
      alpha: 0.8,
      iconPath: [
        1.2, 1.2, 5, 1.2, 5, -1.2, 1.2, -1.2, 1.2, -5, -1.2, -5, -1.2, -1.2, -5, -1.2, -5, 1.2, -1.2, 1.2, -1.2, 5, 1.2,
        5,
      ],
      iconScale: 1.7,
      expandPath: [-3, -1.5, -1.5, -1.5, 0, 0, 3 * (1.5 / 3), -1.5, 3, -1.5, 0, 1.5],
      expandScale: 3,
    },

    cacheThreshold: {
      width: 50,
      height: 30,
      fontSize: 1,
    },

    glowFilterSettings: {
      enabled: false,
      innerStrength: 0,
      outerStrength: 0.5,
      color: 0xaaaaaa,
      quality: 0.1,
      distance: 10,
    },

    text: {
      textFieldGrow: 4,
      paddingLeft: GRID_SIZE * (2 / 3),
      paddingTop: GRID_SIZE * 0.5 - TEXT_PADDING_CORRECTION / 2,
      paddingBottom: GRID_SIZE * 0.5 - TEXT_PADDING_CORRECTION / 2,
      lineHeight: LINE_HEIGHT,
      scale: 1,
      // the text element does not perfectly overlap with the input field
      xCorrection: -TEXT_PADDING_CORRECTION / 2,
      lineHeightCorrection: 1.005,
      textPaddingCorretion: TEXT_PADDING_CORRECTION,
      light: '#ffffff',
      dark: '#364355',
      link: 'blue',
      outlineThickness: 2,
      // if you want to change this to a non-system font, you also need to load the font in public/index.html
      fontFamily: 'Roboto',
      fontWeight: '300',
      size: FONT_SIZE,
      sizeFactors: {
        huge: 20,
        large: 12,
        normal: 4,
        small: 4,
        minimal: 4,
      },
    },

    cornerRadius: 7,
    borderSize: 3,
    scaleFactor: SCALE,

    selected: {
      overlayColorAlpha: 0.09,
      borderSize: 3,
      offset: 2,
      borderColor: '#364355',
      highlightBorderColor: '#8897a0',
      selectedBorderColor: '#419deb',
    },

    headerHandle: {
      alpha: 0.65,
    },

    downloadHandle: {
      color: 'black',
      alpha: 0.2,
      path: [-8.5, 3, -8.5, 15, -4.5, 15, -12.5, 23, -20.5, 15, -16.5, 15, -16.5, 3],
      radius: 12.5,
      padding: 3,
      circleColor: 'grey',
      circleAlpha: 0.2,
    },

    resizeHandle: {
      color: '#419deb',
      size: 14,
    },

    minWidth: 50,
    decollapseRatio: 2 / 3,
    zoomTrapBorderRatio: 1.8,
    moveTrapBorderRatio: 1.6, // 1 means 100% of root children size as border when zooming totally out

    create: {
      // dont need a hight, as the default height will be applied
      height: undefined,
      width: GRID_SIZE * 18,
      scale: SCALE,
    },

    dragNodeSettings: {
      style: {
        width: GRID_SIZE * 18,
        height: GRID_SIZE * 12,
      },
      permanent: true,
    },

    dragImageSettings: {
      style: {
        color: '@transparent',
        borderColor: '@transparent',
        imagePosition: IMAGE_POSITIONS.fullWidth,
        title: '',
        width: GRID_SIZE * 18, // nodes.create.width
      },
      permanent: true,
    },

    addNodeSettings: {
      style: {},
      permanent: true,
    },

    addFrameSettings: {
      style: {
        color: '@transparent',
        borderColor: '@black',
        width: GRID_SIZE * 18,
        height: GRID_SIZE * 12,
        scale: 1.0,
      },
      permanent: true,
    },

    addTableSettings: {
      style: {
        color: '@transparent',
        borderColor: '@transparent',
        title: '',
      },
      permanent: true,
    },

    addTextSettings: {
      style: {
        color: '@transparent',
        borderColor: '@transparent',
        title: 'Text',
      },
      permanent: true,
    },

    addImageSettings: {
      style: {
        color: '@transparent',
        borderColor: '@transparent',
        imagePosition: IMAGE_POSITIONS.body,
        title: '',
        width: GRID_SIZE * 18, // nodes.create.width
      },
      permanent: true,
    },

    addFileSettings: {
      style: {
        width: GRID_SIZE * 18, // nodes.create.width
        height: GRID_SIZE * 20,
      },
      permanent: true,
    },

    createRoot: {
      x: 0,
      y: 0,
      title: 'Unnamed Map',
      width: 1024,
      height: 768,
    },

    defaultBackground: '@white',
    childColorForTransparent: '@black-light',

    // selected: {
    //   shadowEnabled: true,
    //   shadowColor: '#000000',
    //   shadowBlur: 3,
    //   shadowOpacity: 0.8,
    // },
    //
    // highlighted: {
    //   shadowEnabled: true,
    //   shadowColor: '#000000',
    //   shadowBlur: 1,
    //   shadowOpacity: 1.0,
    // },

    zoomToNodePadding: {
      top: 8 + 48 + 8,
      left: 8 + 43 + 8,
      right: 8,
      bottom: 8,
    },

    dragRotate: 0.75,

    headerMarkup: {
      space: 4,
    },

    checkbox: {
      color: '#364355',
      fillColor: '#f1f9ff',
      borderWidth: 0.5,
      lineWidth: (TAG_FONT_SIZE * LINE_HEIGHT) / 12,
      radius: 1.5,
      size: TAG_FONT_SIZE * LINE_HEIGHT, // font size of tags
    },

    tags: {
      searchThreshold: 8,
      colors: ['red', 'orange', 'yellow', 'green', 'blue', 'violet', 'salmon', 'black', 'white'],
      radius: 3,
      paddingHorizontal: 4,
      text: {
        lineHeight: LINE_HEIGHT,
        scale: 1,
        light: '#ffffff',
        dark: '#364355',
        // if you want to change this to a non-system font, you also need to load the font in public/index.html
        fontFamily: 'Roboto',
        fontWeight: '400',
        size: TAG_FONT_SIZE,
        sizeFactors: {
          huge: 40,
          large: 8,
          normal: 2,
          small: 1,
          minimal: 0, // no text will be rendered in here
        },
      },
    },
  },

  edges: {
    pointer: {
      length: 5,
      width: 5,
    },
    arrowPath: [0, 0, -10, 5, -5, 0, -10, -5],
    arrowScale: 1.6,
    defaultColor: 0x666666,
    width: 2.5,
    alpha: 0.5,
    selectedAlpha: 1,
    text: {
      padding: 5, // Pixel
      scale: 1,
      fontFamily: 'Roboto',
      fontWeight: '300',
      size: FONT_SIZE,
      sizeFactors: {
        huge: 20,
        large: 12,
        normal: 4,
        small: 4,
        minimal: 4,
      },
      selectedColor: 'black',
    },
  },

  text: {
    fontIsDarkCorrection: 0.28,
  },
} as const

export default CONFIG
