import React from 'react';
import { Route, Switch } from 'react-router';

import FrontPage from './pages/frontPage/FrontPage';

function App() {
  return (
    <Switch>
      <Route exact path={`/`} component={FrontPage} />
    </Switch>
  );
}

export default App;
