import React, {useEffect, useState} from 'react'
import {Route, Switch, useParams, useRouteMatch} from 'react-router-dom'
import md5 from 'md5'

import MapNew from '../components/pages/MapNew'
import MapViewContainer from '../components/map/MapViewContainer'
import {MapStoreProvider} from '../contexts/mapStore'
import EngineProvider from '../components/engine/EngineProvider'
import MapOverview from '../components/pages/MapOverview'
import {DevModeProvider} from '../contexts/devMode'
import {ExperimentalFeaturesProvider} from '../contexts/experimentalFeatures'
import HomePageLayout from '../components/layout/HomePageLayout'
import MapImport, {MapImportCreate} from '../components/pages/MapImport'
import Tutorial from '../components/pages/Tutorial'
import ErrorAdmin from '../components/pages/ErrorAdmin'
import DashboardAdmin from '../components/pages/DashboardAdmin'
import UserProfile from '../components/pages/CRM/UserProfile'
import useAuth from '../hooks/useAuth'
import GetStarted from '../components/pages/GetStarted'
import MapDeletePage from '../components/map/MapDeletePage'
import MapRepairPage from '../components/map/MapRepairPage'
import DialogProvider from '../contexts/dialog'
import HelmetTitle from '../components/wrapped/HelmetTitle'
import CallToRegister from '../components/pages/CallToRegister'
import Feedback from '../components/pages/Feedback'
import {useTracking} from '../hooks/useTracking'
import ImportMapRender from '../components/map/ImportMapRender'
import CollaborationStoreProvider from '../components/map/collaboration/CollaborationStoreProvider'

const NavigationTracker = () => {
  const {track, setTrackingParameter} = useTracking()
  const {path} = useRouteMatch()
  const {mapId} = useParams()

  useEffect(() => {
    const generalApp = path
    const details = {generalApp}

    if (mapId !== undefined) details.mapId = md5(mapId)

    setTrackingParameter({...details})
    track({action: 'navigation', details})
  }, [setTrackingParameter, track, path, mapId])

  return null
}

const MapsRouter = () => {
  const {path} = useRouteMatch()
  const {isLoggedIn} = useAuth()

  const [measureStartTime] = useState(new Date().getTime())

  return (
    <Switch>
      <Route path={path} exact>
        <NavigationTracker />
        <HelmetTitle titleId="pageTitle.mapsMyMaps" />
        {isLoggedIn ? (
          <MapOverview isPublic={false} key="public" />
        ) : (
          <HomePageLayout>
            <CallToRegister />
          </HomePageLayout>
        )}
      </Route>
      <Route path={`${path}/public`} exact>
        <NavigationTracker />
        <HelmetTitle titleId="pageTitle.mapsPublic" />
        <MapOverview isPublic key="private" />
      </Route>
      <Route path={[`${path}/new`, `${path}/new/from/template/:templateId`, `${path}/new/from/map/:mapId`]} exact>
        <NavigationTracker />
        <HelmetTitle titleId="pageTitle.mapsNew" />
        <HomePageLayout>{isLoggedIn ? <MapNew /> : <CallToRegister />}</HomePageLayout>
      </Route>
      <Route path={`${path}/import`} exact>
        <NavigationTracker />
        <HelmetTitle titleId="pageTitle.mapsImport" />
        <HomePageLayout>{isLoggedIn ? <MapImport /> : <CallToRegister />}</HomePageLayout>
      </Route>
      <Route path={`${path}/import/:mapId`}>
        <NavigationTracker />
        <HelmetTitle titleId="pageTitle.mapsImport" />
        <HomePageLayout>{isLoggedIn ? <MapImportCreate /> : <CallToRegister />}</HomePageLayout>
      </Route>
      <Route path={`${path}/tutorials`} exact>
        <NavigationTracker />
        <HelmetTitle titleId="pageTitle.mapsTutorials" />
        <HomePageLayout>
          <Tutorial />
        </HomePageLayout>
      </Route>
      <Route path={`${path}/get-started`} exact>
        <NavigationTracker />
        <HelmetTitle titleId="pageTitle.mapsGetStarted" />
        <HomePageLayout>
          <GetStarted />
        </HomePageLayout>
      </Route>
      <Route path={`${path}/feedback`} exact>
        <NavigationTracker />
        <HelmetTitle titleId="pageTitle.mapsFeedback" />
        <HomePageLayout>
          <Feedback />
        </HomePageLayout>
      </Route>
      <Route path={`${path}/admin/errors`} exact>
        <NavigationTracker />
        <HelmetTitle titleId="pageTitle.mapsAdminErrors" />
        <HomePageLayout>
          <ErrorAdmin />
        </HomePageLayout>
      </Route>
      <Route path={`${path}/admin/users`} exact>
        <HelmetTitle titleId="pageTitle.mapsAdminCRM" />
        <HomePageLayout>
          <DashboardAdmin />
        </HomePageLayout>
      </Route>
      <Route path={`${path}/admin/users/:id`} exact>
        <HelmetTitle titleId="pageTitle.mapsAdminCRM" />
        <HomePageLayout>
          <UserProfile />
        </HomePageLayout>
      </Route>
      <Route path={`${path}/:mapId/repair`} exact>
        <NavigationTracker />
        <HomePageLayout>
          <MapRepairPage />
        </HomePageLayout>
      </Route>
      <Route path={`${path}/:mapId/delete`} exact>
        <NavigationTracker />
        <HomePageLayout>
          <MapDeletePage />
        </HomePageLayout>
      </Route>
      <Route path={`${path}/:mapId/:nodeId?`}>
        <MapStoreProvider>
          <EngineProvider>
            <CollaborationStoreProvider>
              <DevModeProvider>
                <ExperimentalFeaturesProvider>
                  <DialogProvider>
                    <ImportMapRender />
                    <MapViewContainer measureStartTime={measureStartTime} />
                    <NavigationTracker />
                  </DialogProvider>
                </ExperimentalFeaturesProvider>
              </DevModeProvider>
            </CollaborationStoreProvider>
          </EngineProvider>
        </MapStoreProvider>
      </Route>
    </Switch>
  )
}

export default MapsRouter
