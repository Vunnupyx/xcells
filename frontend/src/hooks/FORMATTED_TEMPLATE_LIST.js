import howToGetStarted from '../assets/templatePictures/HowToGetStarted.svg'
import deepMindmap from '../assets/templatePictures/DeepMindmap.svg'
import flowchart from '../assets/templatePictures/Flowchart.svg'
import kanbanProcess from '../assets/templatePictures/KanbanProcess.svg'
import productManagementKIT from '../assets/templatePictures/ProductManagementKIT.svg'
import thesisOrganization from '../assets/templatePictures/ThesisOrganization.svg'
import theUniverse from '../assets/templatePictures/TheUniverse.png'

/**
 * This list is the preferred order for shown templates and for setting pictures. The others will be show at the end.
 * @see useFormattedTemplateList
 *
 * `localhostIds` is a list where devs can add IDs for their localhost-environment
 */
export const FORMATTED_TEMPLATE_LIST = [
  // How To Get Started
  {
    prodId: '6346f58f6d762e67065900e8',
    devId: '619e7100a8dba2252fd9005a',
    localhostIds: [''],
    picture: howToGetStarted,
  },
  // Deep Mindmap / Example Structures (on prod and dev)
  {
    prodId: '619e6facd87c90a262d56b8c',
    devId: '619e7051a8dba2252fd8fff2',
    localhostIds: ['618a5f3859b6ec41d98fe7f7'],
    picture: deepMindmap,
  },
  // Kanban Process
  {
    prodId: '6189a1bda2238cd89525e3a1',
    devId: '618a853f3a1b8a3c5ce84e60',
    localhostIds: ['618a5f6559b6ec41d98fe80d'],
    picture: kanbanProcess,
  },
  // Thesis Organization
  {
    prodId: '6219033336f66ab5abca4281',
    devId: '6346eab27a956b7b64699924',
    localhostIds: ['618a5f7a59b6ec41d98fe81d'],
    picture: thesisOrganization,
    properties: {
      shownName: 'Thesis Organization',
    },
  },
  // Flowchart
  {
    prodId: '6189a244a2238cd89525e3a9',
    devId: '618a858c3a1b8a3c5ce84e91',
    localhostIds: ['618a5f9c59b6ec41d98fe91d'],
    picture: flowchart,
  },
  // Product Management KIT
  {
    prodId: '6189a2fba2238cd89525e3e9',
    devId: '618adedbe0002e7ad1df32ed',
    localhostIds: ['618a5fae59b6ec41d98fe969'],
    picture: productManagementKIT,
    properties: {
      shownName: 'Product Management Kit',
    },
  },
  // The Universe
  {
    prodId: '6189a3455e9e9c70de5d6892',
    devId: '618a8726e0002e7ad1df17b3',
    localhostIds: ['618a5f8b59b6ec41d98fe82d'],
    picture: theUniverse,
    properties: {imageFit: 'cover'},
  },
]
