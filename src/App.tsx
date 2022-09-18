import React from 'react';
import { useRoutes } from 'react-router-dom';
import { setClientConfig } from './client';
import clientConfig from './client/config';
import routes from './routes';

setClientConfig(clientConfig);

function App(): React.ReactElement {
  const routing = useRoutes(routes);
  return <>{routing}</>;
}

export default App;
