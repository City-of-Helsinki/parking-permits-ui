import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { Route, Router, Switch } from 'react-router';

import './i18n/i18n';
import './styles/main.scss';

import App from './App';
import reportWebVitals from './reportWebVitals';

const history = createBrowserHistory();

ReactDOM.render(
  <Router history={history}>
    <Switch>
      <Route path="/" component={App} />
    </Switch>
  </Router>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
