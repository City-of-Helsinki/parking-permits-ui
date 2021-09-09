import { Container } from 'hds-react';
import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router';
import './app.scss';
import { setClientConfig } from './client';
import clientConfig from './client/config';
import { useClient } from './client/hooks';
import OidcCallback from './client/OidcCallback';
import { ApiAccessTokenActions } from './client/types';
import { ApiAccessTokenContext } from './common/apiAccessTokenProvider';
import Footer from './common/footer/Footer';
import Navbar from './common/navbar/Navbar';
import Stepper from './common/stepper/Stepper';
import FrontPage from './pages/frontPage/FrontPage';
import LandingPage from './pages/landingPage/LandingPage';
import ProfilePage from './pages/profilePage/ProfilePage';
import { StoreState } from './redux';
import { fetchUserProfile } from './redux/actions/helsinkiProfile';

setClientConfig(clientConfig);

function App(): React.ReactElement {
  const client = useClient();
  const dispatch = useDispatch();
  const { callbackPath } = clientConfig;
  const isCallbackUrl = useRouteMatch(callbackPath);
  const { permitCartState, helsinkiProfileState, talpaState } = useSelector(
    (state: StoreState) => state
  );

  const actions = useContext(ApiAccessTokenContext) as ApiAccessTokenActions;
  const { getStatus: getAPITokenStatus } = actions;

  if (callbackPath && isCallbackUrl) {
    return <OidcCallback successRedirect="/" failureRedirect="/authError" />;
  }

  if (
    getAPITokenStatus() === 'loaded' &&
    !helsinkiProfileState?.fetchingStatus
  ) {
    dispatch(fetchUserProfile());
  }

  return (
    <div className="app-page">
      <Navbar
        currentStep={permitCartState.currentStep}
        authenticated={client.isAuthenticated()}
      />
      {permitCartState.currentStep > 1 && (
        <div className="stepper-component">
          <Container>
            <Stepper currentStep={permitCartState.currentStep} />
          </Container>
        </div>
      )}
      <Container className="app-page__container">
        <Switch>
          {client.isAuthenticated() ? (
            <Route
              exact
              path="/"
              component={() => (
                <FrontPage
                  talpaState={talpaState}
                  permitCartState={permitCartState}
                  profile={helsinkiProfileState.profile}
                  currentStep={permitCartState.currentStep}
                />
              )}
            />
          ) : (
            <Route exact path="/" component={LandingPage} />
          )}
          {client.isAuthenticated() ? (
            <Route exact path="/profile" component={ProfilePage} />
          ) : (
            <Redirect to="/" />
          )}
        </Switch>
      </Container>
      <Footer />
    </div>
  );
}

export default App;
