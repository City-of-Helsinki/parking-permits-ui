import React from 'react';
import { Route, Redirect, Switch, useRouteMatch } from 'react-router';
import StoreProvider from './redux/StoreProvider';
import { ClientProvider } from './client/ClientProvider';
import { setClientConfig } from './client';

import clientConfig from './client/config';
import FrontPage from './pages/frontPage/FrontPage';
import OidcCallback from './client/OidcCallback';
import { ApiAccessTokenProvider } from './common/apiAccessTokenProvider';
import Navbar from './common/navbar/Navbar';
import Footer from './common/footer/Footer';
import './app.scss';
import ProfilePage from './pages/profilePage/ProfilePage';
import { useClient } from './client/hooks';

setClientConfig(clientConfig);

function App(): React.ReactElement {
  const client = useClient();
  const { callbackPath } = clientConfig;
  const isCallbackUrl = useRouteMatch(callbackPath);
  if (callbackPath && isCallbackUrl) {
    return <OidcCallback successRedirect="/" failureRedirect="/authError" />;
  }

  return (
    <ClientProvider>
      <StoreProvider>
        <ApiAccessTokenProvider>
          <div className="page-layout">
            <Navbar />
            <main>
              <Switch>
                {client.isAuthenticated() && (
                  <Route exact path="/" component={FrontPage} />
                )}
                {client.isAuthenticated() ? (
                  <Route exact path="/profile" component={ProfilePage} />
                ) : (
                  <Redirect to="/" />
                )}
              </Switch>
            </main>
            <Footer />
          </div>
        </ApiAccessTokenProvider>
      </StoreProvider>
    </ClientProvider>
  );
}

export default App;
