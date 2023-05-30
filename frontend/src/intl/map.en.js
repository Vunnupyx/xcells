export default {
  mapList: 'My Maps',
  mapListHome: 'Home',
  mapListPublic: 'Public Maps',
  mapUpload: 'Upload Map',
  mapNew: 'Create Map',
  mapDelete: 'Delete Map',
  mapTemplates: 'Templates',

  mapListClosedCreate: 'Create',
  mapListClosedCommunity: 'Public Maps',
  mapListClosedMyMaps: 'My Maps',
  mapListClosedTemplates: 'Templates',
  mapListClosedUpload: 'Upload Map',

  mapStoreLoginToEdit: 'Please log in to edit this map.',
  mapStoreNotWriteAccess: 'You have no access to edit this map.',
  mapStoreAuthenticationMissing: 'Authentication missing, please login.',
  mapStoreSocketBackendError: 'An error occured when send event {event}: {message}',
  mapStoreLimitWarning:
    'You reached {nodeCount} of {limitNodes} cards in this map. Please <a>consider subscribing</a>!',
  mapStoreLimitReached:
    'You reached your limit of {limitNodes} cards. If you want to create more ' +
    'cards please consider a higher <subscribe>subscription</subscribe>.',
  mapStoreSocketCannotDispatch: 'Could not save your changes.',

  mapStoreSocketEventTimeout: 'Connection timed out. Reload if there are any problems.',
  mapStoreSocketMapError: 'Connection error. Reload if there are any problems.',
  mapStoreSocketChangesNotSaved: 'Your changes were not saved, because you are not connected to the server.',

  import: {
    title: 'Import a Map',
    message: 'The following file types are supported:',
    types: {
      imap: {
        primary: 'iMapping Format',
        secondary: 'File format of the original iMapping Tool.',
      },
      json: {
        primary: 'Infinity Maps Export Format (.json)',
        secondary: 'An export from infinity maps.',
      },
      txt: {
        primary: 'Outliner',
        secondary: 'A text file with space indented text.',
      },
    },
    suggestMore: 'And many more to come! <feedback>Suggest the file type you miss</feedback>.',
    button: 'Upload From Your Device',
  },
  importSpinner: 'Importing (this might take some time)...',
  uploadSpinner: 'Uploading (this might take some time)...',

  searchForMap: 'Search for Map Title',

  userPopoverUpgradeAccount: 'Upgrade Your Account',
  userPopoverSettings: 'Settings',
  userPopoverAppsIntegrations: 'Apps & Integrations',
  userPopoverManageAccount: 'Manage Your Account',
  userPopoverLogOut: 'Log Out',
  userPopoverDeleteMap: 'Delete this Map',
  userPopoverUploadMap: 'Upload Map',

  signupMessageForGuests: 'Get your free account now and create your own deep knowledge maps',

  mapCardPrivacyPublicTitle: 'Everyone can find this map.',
  mapCardPrivacyPublicUnlistedTitle: 'Only people with the link can see this map.',
  mapCardPrivacyPrivateTitle: 'Only you can access this map.',
  mapCardPrivacyPublic: 'Public',
  mapCardPrivacyPublicUnlisted: 'Public unlisted',
  mapCardPrivacyPrivate: 'Private',

  mapShare: {
    accessRoles: {
      owner: 'Owner',
      contributor: 'Mapper',
      reader: 'Reader',
    },
  },

  mapTitle: 'Title',
  mapShared: 'Shared',
  mapCreating: 'Creating a New Map',
  mapUploadAlertFailed: 'Failed to upload the map.',
  mapUploadAlertSuccess: 'Successfully uploaded the map.',
  mapColor: 'Color',
  mapScale: 'Scale',
  mapUploadError: 'Failed to upload your file.',
  mapUploadErrorHeic: '.heic-images are not supported yet',
  mapLoading: 'Loading map',
  mapIsPublic: 'Public',
  mapCreateReachedMapLimit: 'Your reached your map limit of {limitMaps, plural, one {one map} other {# maps}}.',
  mapCreateNeedsSubscription:
    'To create a new map, your need <subscribe>to subscribe</subscribe>. If you want to evaluate first, you can ' +
    '<register>register for a test version</register>.',
  mapLoadingError: 'Error while loading the map: {message}',
  mapAccessDenied:
    'Access to this map was denied, please <login>log in</login> with an account with access rights to this map.',
  mapLoginNeeded:
    'You need to <login>log in</login> to access this map.' +
    ' If you have no account yet, consider <register>registering</register>.',
  mapDeleteSuccessful: 'Your map was successfully deleted',
  mapDeleteFailed: 'Your map could not be deleted.',
  mapRepairSuccessful: 'Your map was successfully repaired.',
  mapRepairFailed: 'Could not repair the map.',
  mapRepairInProgressMessage: 'Your map is being repaired ...',

  errorMessage: 'Error Message',

  deleteMapDialogText: 'Do you really want to delete your Map? It can not be recovered.',
  deleteMapDialogTitle: 'Delete Map',
  deleteMapButtonOk: 'Delete Map',
  deleteMapMessage: 'This will delete your Map and it cannot be undone. Are you sure?',
  deleteMapWarning: 'Users who are still working on this map will receive errors.',

  dialogMapPrivacyOpenerTitle: 'Change Privacy',
  dialogMapPrivacyMessage: 'Choose here, how your map can be found, viewed or edited by others:',
  dialogMapPrivacyTitle: 'Sharing / Visibility',

  dialog: {
    repair: {
      title: 'Repair Map',
      message:
        'Repair inconsistencies in the map data model and also compact the changelog of this map. ' +
        'This will reduce loading time and memory consumption of the map.',
      warning:
        'Users who are currently working on this map will not be able to save their changes after repairing. ' +
        "Users, who have unsaved changes and are offline, won't be able to merge their changes after repairing. " +
        'Make sure no one is working on this map while you repair it. ',
      buttonOk: 'Repair Map',
    },
    tag: {
      update: 'Update Tag',
      create: 'Create Tag',
      fields: {
        name: 'Name',
        color: 'Color',
      },
      errors: {
        nameRequired: 'A name is mandatory.',
        nameExists: 'This name already exists.',
        colorRequired: 'A color is mandatory.',
      },
    },
    manageTags: {
      title: 'Manage Map Tags',
      create: 'Create a new tag ...',
    },
    manageNodeTags: {
      searchPlaceholder: 'Filter tags ...',
      showAll: 'Show all',
      showLess: 'Show less',
      title: 'Add Tag To Card',
      create: 'Create and add a new tag ...',
    },
    editTable: {
      title: 'Edit Table',
      add: 'Add',
      delete: 'Delete',
      applyChanges: 'Apply Changes',
    },
    integration: {
      title: 'xCells Marketplace',
    },
  },

  button: {
    login: 'Log In',
    close: 'Close',
  },
  buttonShare: 'Public',
  buttonShareWritable: 'Public Writeable',
  buttonShareWritableMessage: 'Everyone can edit it (Administrators only)',
  buttonShareWritableHidden: 'Public Unlisted Writeable',
  buttonShareWritableHiddenMessage: 'Everyone with the link to the map can edit it',
  buttonShareMessage: 'Everyone can find it in the list of public maps',
  buttonShareHidden: 'Public Unlisted',
  buttonShareHiddenMessage: 'Everyone with the map link can view your map',
  buttonUnshare: 'Private',
  buttonUnshareMessage: 'Only you can view this map',
  buttonGetWebGl: 'How To Enable WebGL',
  buttonHome: 'Home',
  buttonReload: 'Reload',
  buttonDetails: 'Details',
  buttonSignUp: 'Sign Up',
  buttonCancel: 'Cancel',
  buttonGetStarted: 'Get Started',
  buttonCreateMap: 'Create New Map',
  buttonSubscribe: 'Subscribe',
  buttonBackInHistory: 'Back',
  buttonRegister: 'Signup For Free',
  buttonOk: 'Ok',
  buttonInvite: 'Invite A Friend',

  OK: 'OK',
  submit: 'Submit',
  delete: 'Delete',
  cookieNote: 'We are using cookies to provide you the best experience possible.',
  save: 'Save',
  create: 'Create',
  cancel: 'Cancel',
  insert: 'Insert',
  searchForNode: 'Search for a card',

  search: {
    result: {
      directChildCount: 'Direct children count',
      totalChildCount: 'Total offspring count',
    },
  },

  changed: 'Updated',
  created: 'Created',

  login: {
    noLoginData: 'Login data could not be loaded. Do you have a working network connection?',
  },
  loginForgotPassword: 'Forgot password?',
  loginSignUp: 'Register',
  loginTitle: 'Log In',
  username: 'Username',
  email: 'Email',
  password: 'Password',
  version: 'Version',
  signupTitle: 'Sign Up',
  usernameRequired: 'Username is required',
  emailRequired: 'Email is required',
  invalidEmailAddress: 'Provide a valid email address',
  passwordRequired: 'Password is required',
  invalidPassword: 'Must Contain 8 Characters, One Uppercase, One Number and One Special Case Character',
  alreadyExistAccount: 'Already have an account?',
  notRegistered: "Don't have an account?",
  createAccount: 'Create Account',
  signupDialogTitle: 'Thank You For Signing Up!',
  signupDialogMessage:
    '<b>Your account is currently in the waitlist for manual approval.</b> You will receive an email notification once your account has been approved.<br><br><b>We appreciate your patience and look forward to having you as a user of our product!</b>',

  authSessionExpired: 'Your session expired. Please login again.',

  signupSuccess: 'User has been registered and is awaiting activation.',
  errorRequestHandling: 'A server error occurred.',
  errorServer: 'A server error occurred. Please try again later.',
  errorLogin: 'Username or password is incorrect.',
  errorInvalidServerMessage: 'Received invalid server response.',
  errorRuntime: 'An error occured while handling your request.',
  errorLoginPassword: 'Password incorrect.',
  errorLoginUsername: 'Unknown username.',
  errorErrorToBackendSuccess: 'Successfully submitted error for further investigation',
  errorUnknown: 'Unknown error occured.',
  errorList: 'Error List',
  error404: 'The page you requested was not found.',
  adminList: 'User Stats',
  adminWaitlist: 'Waitlist',

  clientErrorUserId: 'User ID',
  clientErrorPath: 'Url Path',
  clientErrorBacktrace: 'Backtrace',
  clientErrorAdditions: 'Additions',

  subscribeDialogTitle: 'Please consider subscribing',

  shareDialog: {
    title: 'Share a map with another user',
    description:
      'Search a user by username or email address. If you want to share a map with someone who has no ' +
      'account yet, you can use an <invite>invite link</invite> and gain 200 extra cards.',
    infoPopover: {
      title: 'Access Rights Of Roles',
      ownerExplanation: 'can read, write, change permissions and share.',
      contributorExplanation: 'can read and make changes to the map.',
      readerExplanation: 'have only read access.',
    },
    inputLabel: 'Search for users',
    inputLabelLimit: 'min. 3 characters or exact match',
    types: {
      user: 'User',
      group: 'Group',
      mail: 'Mail',
    },
    warnings: {
      tooShort: 'Use longer search terms',
      noUser: 'User not found, try different name',
      noEmail: 'No user by e-mail, try different one or <invite>invite to signup</invite>',
      emailInProgress: 'No user by e-mail yet, please provide existing e-mail or <invite>invite to signup</invite>',
    },
    buttons: {
      closeDialogButton: 'Apply',
    },
  },

  toolbarButtonShare: 'Share',
  toolbarTooltipShare: 'Share, publish and collaborate',

  toolbarTooltipInfinityMapLogo: 'Go to Infinity Maps dashboard',
  toolbarTooltipMapName: 'Change name of the map',
  toolbarTooltipSearch: 'Search',
  toolbarTooltipExport: 'Export',
  toolbarTooltipMapOptions: 'Map options',
  toolbarTooltipSettings: 'Settings',
  toolbarTooltipHelp: 'Help',
  toolbarTooltipAccount: 'Account',
  toolbarTooltipFocusMode: 'Focus mode',

  toolbarTooltipUndo: 'Undo (Ctrl+Z)',
  toolbarTooltipRedo: 'Redo (Ctrl+Y)',
  toolbarTooltipNavigationMode: 'Navigation Mode: Navigate through your map (Default).',
  toolbarTooltipCreateNodeMode: 'Add Card (Ctrl/Cmd+Shift+Click or Drag)',
  toolbarTooltipCreateFrame: 'Add Frame (transparent background)',
  toolbarTooltipCreateTable: 'Add Table',
  toolbarTooltipCreateText: 'Add Text (transparent background and border)',
  toolbarTooltipCreateFile: 'Add File or Image',
  toolbarTooltipInsertTemplate: 'Insert Template',
  snackbarInfoAddCard: 'Now click where you want the card to be inserted',

  toolbarTooltipMoveNodeMode: 'Card Moving Mode: Drag cards to move them (also with Alt+Drag).',
  toolbarTooltipSelectNodeMode: 'Card Selection Mode: Select multiple cards (Ctrl+Click).',
  toolbarTooltipCreateEdgeMode: 'Create collection/arrow (Alt+Shift+Click)',
  toolbarTooltipColorRed: 'Red Background (Ctrl+1)',
  toolbarTooltipColorOrange: 'Orange Background (Ctrl+2)',
  toolbarTooltipColorYellow: 'Yellow Background (Ctrl+3)',
  toolbarTooltipColorGreen: 'Green Background (Ctrl+4)',
  toolbarTooltipColorBlue: 'Blue Background (Ctrl+5)',
  toolbarTooltipColorViolet: 'Violet Background (Ctrl+6)',
  toolbarTooltipColorWhite: 'White Background (Ctrl+7)',
  toolbarTooltipColorGray: 'Gray Background (Ctrl+8)',
  toolbarTooltipColorBlack: 'Black Background (Ctrl+9)',
  toolbarTooltipColorSalmon: 'Salmon Background',
  toolbarTooltipColorTransparent: 'Transparent Background',
  toolbarTooltipColorRedLight: 'Red Background Light',
  toolbarTooltipColorOrangeLight: 'Orange Background Light',
  toolbarTooltipColorYellowLight: 'Yellow Background Light',
  toolbarTooltipColorGreenLight: 'Green Background Light',
  toolbarTooltipColorBlueLight: 'Blue Background Light',
  toolbarTooltipColorVioletLight: 'Violet Background Light',
  toolbarTooltipColorWhiteLight: 'White Background Light',
  toolbarTooltipColorGrayLight: 'Gray Background Light',
  toolbarTooltipColorBlackLight: 'Black Background Light',
  toolbarTooltipColorSalmonLight: 'Salmon Background Light',
  toolbarTooltipColorTransparentLight: 'Transparent Background Light',
  toolbarTooltipColorClear: 'Automatic Background Color (Ctrl+0)',
  toolbarTooltipBorderColorRed: 'Red Border (Ctrl+Shift+1)',
  toolbarTooltipBorderColorOrange: 'Orange Border (Ctrl+Shift+2)',
  toolbarTooltipBorderColorYellow: 'Yellow Border (Ctrl+Shift+3)',
  toolbarTooltipBorderColorGreen: 'Green Border (Ctrl+Shift+4)',
  toolbarTooltipBorderColorBlue: 'Blue Border (Ctrl+Shift+5)',
  toolbarTooltipBorderColorViolet: 'Violet Border (Ctrl+Shift+6)',
  toolbarTooltipBorderColorWhite: 'White Border (Ctrl+Shift+7)',
  toolbarTooltipBorderColorGray: 'Gray Border (Ctrl+Shift+8)',
  toolbarTooltipBorderColorBlack: 'Black Border (Ctrl+Shift+9)',
  toolbarTooltipBorderColorSalmon: 'Salmon Border',
  toolbarTooltipBorderColorTransparent: 'Transparent Border',
  toolbarTooltipBorderColorRedLight: 'Red Border Light',
  toolbarTooltipBorderColorOrangeLight: 'Orange Border Light',
  toolbarTooltipBorderColorYellowLight: 'Yellow Border Light',
  toolbarTooltipBorderColorGreenLight: 'Green Border Light',
  toolbarTooltipBorderColorBlueLight: 'Blue Border Light',
  toolbarTooltipBorderColorVioletLight: 'Violet Border Light',
  toolbarTooltipBorderColorWhiteLight: 'White Border Light',
  toolbarTooltipBorderColorGrayLight: 'Gray Border Light',
  toolbarTooltipBorderColorBlackLight: 'Black Border Light',
  toolbarTooltipBorderColorSalmonLight: 'Salmon Border Light',
  toolbarTooltipBorderColorTransparentLight: 'Transparent Border Light',
  toolbarTooltipBorderColorClear: 'No Border (Ctrl+Shift+0)',
  toolbarTooltipScaleDown: 'Scale Content Down (Ctrl+Shift+Minus)',
  toolbarTooltipScaleUp: 'Scale Content Up (Ctrl+Shift+Plus)',
  toolbarTooltipDelete: 'Delete selected cards and connections (also with Delete or Backspace)',
  toolbarTooltipEdit: 'Edit card text',

  toolbarMenuCreateEdgeMode: 'Create connection',
  toolbarMenuRedo: 'Redo',
  toolbarMenuScaleUp: 'Scale Up',
  toolbarMenuScaleDown: 'Scale Down',
  toolbarMenuDuplicate: 'Duplicate',
  toolbarMenuDelete: 'Delete',
  toolbarMenuFile: 'Add File',
  toolbarMenuFileDelete: 'Remove Attached File',
  toolbarMenuImage: 'Add Image',
  toolbarMenuImageDelete: 'Remove Image from Card',
  toolbarMenuTemplate: 'Template',
  toolbarMenuCopy: 'Copy',
  toolbarMenuCut: 'Cut',
  toolbarMenuPaste: 'Paste',
  toolbarMenuBodyColor: 'Body Color',
  toolbarMenuBorderColor: 'Border Color',
  toolbarMenuImageSettings: 'Image',
  toolbarMenuFileSettings: 'File',
  toolbarMenuCopyURL: 'Copy URL to current Card',
  toolbarMenuCardReorder: 'Reorganize',
  toolbarMenuReorgCompactDirect: 'Compactify',
  toolbarMenuReorgCompactAll: 'Compactify deep',
  toolbarMenuReorgListDirect: 'Listify',
  toolbarMenuReorgListAll: 'Listify deep',
  toolbarMenuReorgGridDirect: 'Gridify',
  toolbarMenuReorgGridAll: 'Gridify deep',
  toolbarMenuReorgHeart: 'Heart',
  toolbarMenuReorgCircle: 'Circle',
  toolbarMenuReorgInfinity: 'Infinity',

  toolbarMenu: {
    editTable: 'Edit Table',
    checkBox: {
      add: 'Add Checkbox',
      remove: 'Remove Checkbox',
    },
    manageTags: 'Manage Card Tags',
    showAllEdges: {
      tooltip: 'Show all connections of the map, independent of selection and hovering.',
      label: 'Show Connections',
    },
    showGhosts: {
      tooltip: 'Show buttons to add new cards.',
      label: 'Show Add Card Buttons',
    },
    performanceMode: {
      tooltip: 'Show less details to increase speed of the app or save power.',
      label: 'High Speed Mode',
    },
    accessibility: {
      tooltip: 'Overlay maps with divs for screen readers and similar tools.',
      label: 'Accessibility Overlay',
    },
    pdfMetaData: {
      tooltip: 'Adds the option to extract additional data if a pdf is dropped',
      label: 'PDF Metadata Import',
    },
    imagePositionTooltip: 'Change the position of the background image inside the selected cards',
    imagePositionTitle: 'Image Positions',
    imagePositions: {
      titles: {
        body: 'Below Text Header',
        crop: 'Crop to Fit',
        stretch: 'Stretch to Fit',
        fullWidth: 'Fill Card Header',
      },
      tooltips: {
        crop: 'Crop height or width to fill the whole card.',
        body: 'Show whole image below card header / text-area.',
        stretch: "Show the whole image and stretch it to fit the card's dimensions.",
        fullWidth: 'Show the whole width of the image and align it to the top of the card.',
      },
    },
  },

  templateInsert: 'Insert / Manage Templates',
  templateCreate: 'Create New Template',
  templateTooltip: 'Manage Card Templates.',
  templateCreateTitle: 'Create a new template from the current card',
  templateName: 'Name',
  templateKeywords: 'Keywords',
  templateIsPublic: 'Publicly available',
  templateIsPublicShort: 'Public',

  mapCardCreated: 'created',
  mapCardUpdated: 'updated',
  mapCardTimeAgo: 'ago',

  drawerToggleButtonAll: 'All',
  drawerToggleButtonPublic: 'Public',
  drawerToggleButtonPublicUnlisted: 'Public Unlisted',
  drawerToggleButtonFavorites: 'Favorites',
  drawerToggleButtonPrivate: 'Private',

  templateInsertTitle: 'Select a template to insert it in your map',
  templateSaveSuccess: 'Your template was saved.',

  pdfTemplateDialogTitle: 'PDF-Card (Beta)',
  pdfTemplateDialogText: 'Do you want automatically extracted information from the PDF to be shown in a card?',
  pdfTemplateButtonOk: 'Extract',

  jsonTemplateDialogTitle: 'JSON-Card (Beta)',
  jsonTemplateDialogText: 'Do you want the JSON-Object to be visualized with cards?',
  jsonTemplateButtonOk: 'Visualize',

  pasteActionDialogTitle: 'Display Option',
  pasteActionDialogMessage: 'How do you want your data displayed?',
  pasteActionNames: {
    pasteFile: 'Insert file',
    pasteImage: 'Insert image',
    pasteJson: 'Visualize JSON-Object',
    pastePdfFile: 'Show PDF metadata',
    pasteText: 'Insert text',
  },

  pdfTemplateDownload: 'Download',
  pdfTemplateAuthor: 'Author: ',
  pdfTemplateSubject: 'Subject: ',
  pdfTemplateKeywords: 'Keywords: ',
  pdfTemplateCreationDate: 'Creation Date: ',
  pdfTemplateOutline: 'Outline',
  pdfTemplateOutlineNotFound: ': not found',

  menu: {
    export: {
      title: 'Export Map as',
      json: {
        title: 'JSON File (standard)',
        note: 'Can be imported as new map. Files and images over 20 MB are omitted.',
      },
      text: {
        title: 'Indented Text',
        note: 'Text file. Attached files and images are omitted.',
      },
      zip: {
        title: 'Zip File (Beta)',
        note: 'Includes all files and images, but can not be imported, yet.',
      },
      markDown: {
        title: 'MarkDown File (Beta)',
        note: 'Files and images are omitted.',
      },
    },
    tag: {
      title: 'Manage Tags',
    },
  },

  menuLogout: 'Log Out',
  menuLogin: 'Log In',
  menuSignup: 'Sign Up',
  menuProfile: 'Profile',
  menuLegalNotice: 'Legal Notice',
  menuFeedback: 'Feedback',
  menuTutorial: 'Tutorial',
  menuHelp: 'Help',
  menuListHome: 'Home',
  menuTutorials: 'Tutorials',
  menuGetStarted: 'Get Started',
  menuMapInteractionHelp: 'Actions and Shortcuts',
  menuNewMap: 'New',
  menuImportMap: 'Import',
  menuDeleteMap: 'Delete',
  menuMapHistory: 'History',
  menuExportMap: 'Export',
  menuRepairMap: 'Repair',
  menuVisibility: 'Set Visibility',
  menuShare: 'Invite Team Member',

  menuTitleHelp: 'Help',
  menuTitleMap: 'Map Options',
  menuTitleShare: 'Share Options',

  homeVideoTutorials: 'Tutorials',
  homeVideoIntroductions: 'Introductions',
  homeVideoUseCases: 'Use Cases',
  homeVideoExamples: 'Examples',

  homeGetStartedTitle: 'Get started',
  homeGetStartedSubtitle: 'with creating your own infinite knowledge maps!',
  homeGetStartedSummary:
    'Learn how to use Infinity Maps to project your knowledge into an infinite canvas and get a better understanding,' +
    ' find correlations and ',
  homeGetStartedCreateMapButton: 'Create A Map',
  homeGetStartedMoreTutorialsButton: 'More Tutorials',

  homeDeleteMapMessage: 'Your map and all its pictures and files are being deleted...',

  emptyMapsHeader: 'Get started with Infinity Maps',
  emptyMapsMessages:
    'Knowledge management with Infinity Maps helps you organize, structure, and share your knowledge – in one deep knowledge map. Start your knowledge management with Infinity Maps now.',

  drawerCommunity: 'Public Maps',
  drawerMyMaps: 'My Maps',
  drawerImportMaps: 'Import Map',
  drawerCreateMap: 'Create Map',

  drawerFeedback: 'Feedback',
  drawerAbout: 'About',
  drawerHelp: 'Help',
  drawerTutorial: 'Tutorial',

  tabAll: 'All',
  tabPrivate: 'Private',
  tabPublic: 'Public',
  tabPublicUnlisted: 'Public Unlisted',

  homePublicText: 'Public Maps',
  homePrivateText: 'My Maps',

  callToRegisterTitle: 'Start Your Own Maps',
  callToRegisterMessages:
    'Knowledge management with Infinity Maps helps you organize, structure, and share your knowledge – in one deep knowledge map. Start your knowledge management with Infinity Maps now.',

  userPopoverAppMoreMaps: 'More Public Maps',

  mapAddCategoryLabel: 'Add Category',
  mapAddCategoryTooltip: 'add Category',

  progressIsLoading: 'Loading ...',

  devMode: {
    viewportStats: {
      position: 'Position',
      scale: 'Scale',
    },
  },

  devModeMenuLabel: 'Nerd Info',
  devModeBenchmarkMenuLabel: 'Benchmark Options',
  devModeMenuDebugLogsLabel: 'Debug Logs',
  devModeMenuFloodLogsLabel: 'Flood Logs',
  devModeMenuPerformanceLogsLabel: 'Performance Logs',
  devModeMenuShowMetricsLabel: 'Global Metrics',
  devModeMenuMapStatsLabel: 'Map Stats',
  devModeMenuFpsCounterLabel: 'FPS Counter',
  devModeMenuSystemInformationLabel: 'System Information',
  devModeMenuFpsTickerRunLabel: 'Render Continuously',
  devModeDialogFpsAnimationLabel: 'Last animation',
  devModeNodeJumpLabel: 'Zoom to node',
  devModeCircleBenchmarkLabel: 'Circle benchmark',

  devModeBenchmarkRunCircle: 'Run circle',
  devModeBenchmarkEverything: 'Everything',
  devModeBenchmarkToStartOnly: 'To start only',
  devModeBenchmarkToEndOnly: 'To end only',
  devModeBenchmarkZoomTo: 'Zoom to',
  devModeBenchmarkZoomToNode: 'Zoom to node',
  devModeBenchmarkGetSelected: 'Get selected',
  devModeBenchmarkChromiumOnly: 'Supports Chromium based browsers only.',
  devModeBenchmarkCircleBenchmark: 'Circle benchmark',
  devModeBenchmarkNodeId: 'Card ID',
  devModeBenchmarkStartNode: 'Start node',
  devModeBenchmarkEndNode: 'End node',
  devModeBenchmarkAppSize: 'App size',

  experimentalModeMenuLabel: 'Experimental',
  experimentalAdvancedNavigation: 'Alternative Scrolling',
  experimentalAdvancedNavigationHelp: 'Allow horizontal scrolling and shift+scroll to move scene instead of zooming',

  renderEngineInitErrorTitle: 'The map cannot be displayed',
  renderEngineInitErrorWebGl: 'Please activate WebGL or restart your browser if it is already activated.',
  renderEngineInitErrorUnknown: 'Rendering the map failed, restarting your browser or device might solve the problem.',

  pageTitle: {
    mapsMyMaps: 'My Maps',
    mapsPublic: 'Public Maps',
    mapsNew: 'Create a New Map',
    mapsImport: 'Import',
    mapsTutorials: 'Tutorials',
    mapsGetStarted: 'Get Started',
    mapsFeedback: 'Feedback',
    mapsAdminErrors: 'ADMIN: Errors',
    mapsAdminCRM: 'User Stats',
    mapsAdminWaitlist: 'Waitlist',
    login: 'Login',
    settings: 'Settings',
  },

  warningMobile:
    'Support for mobile devices is very limited at the moment, because of the high resource demand. ' +
    'We recommend a desktop browser.',

  warningTablet: 'Support for tablets is still experimental. We recommend a desktop browser for now.',

  warningDoNotPasteOnRootPleaseSelectCard: 'Cannot paste the image into the map, please select a card first',

  history: {
    title: 'Map History',
    noMessage: 'unknown action',
    searchLabel: 'Search for actions',
    opsTable: {
      type: 'Type',
      objId: 'Object Id',
      key: 'Key',
      value: 'Value',
    },
    nodes: 'Cards',
    edges: 'Connections',
    actions: {
      create: 'Map created',
      repair: 'Map repaired',
      repairAddEdges: 'Connections repaired',
      repairAddNodes: 'Cards repaired',
      /* compact was renamed to repair. But if a map was repaired before this change
      the following 3 messages are stored in its history. Therefore they have to
      remain. */
      compact: 'Map repaired',
      compactAddEdges: 'Connections repaired',
      compactAddNodes: 'Cards repaired',
      copyMap: 'Map copied',
      import: 'Map imported',
      fromTemplate: 'Map from template created',
      nodeMove: 'Card moved',
      nodeResize: 'Card resized',
      nodeEdit: 'Card title edited',
      nodeAdd: 'Card added',
      nodeScale: 'Card scaled',
      nodeSetImage: 'Card background image added',
      nodeSetImagePosition: 'Card image position changed',
      nodeSetFile: 'Card file added',
      nodeSetColor: 'Card colored',
      nodeSetBorderColor: 'Card border colored',
      nodeRemove: 'Card removed',
      nodeDuplicate: 'Card duplicated',
      nodeAll: 'Card multi change',
      edgeAdd: 'Edge added',
      templateAdd: 'Template added',
      edgeRemove: 'Edge removed',
      edgeSetColor: 'Edge colored',
      nodeEditEdge: 'Edge title edited',
    },
  },
  admin: {
    crm: {
      userProfile: {
        commentSaveSuccess: 'Your comment was saved successfully',
      },
      waitlist: {
        ActivateAccountSuccess: 'Account has been activated successfully',
        ActivateAccountError: 'Failed to activate',
      },
    },
  },
  settingsLayout: {
    profileSettings: 'Profile settings',
    appsIntegrations: 'Apps & Integrations',
  },
  profileSettings: {
    applyChanges: 'Apply Changes',
    emailAddress: 'Email Address',
    editProfile: 'Edit Profile',
    appsIntegrations: 'Apps & Integrations',
    username: 'Username',
    success: 'Success',
    unknown: 'Unknown',
  },
  integrationSettings: {
    appsIntegrations: 'Apps & Integrations',
    addApps: 'Add apps',
  },
  integration: {
    openai: {
      title: 'OpenAI ChatGPT',
    },
  },
}
