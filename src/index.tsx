import React from 'react';
import ReactDOM from 'react-dom';
import { init } from '@sentry/browser';
import { BrowserRouter } from 'react-router-dom';

import './i18n/i18n';
import './assets/styles/main.scss';

import App from './App';
import reportWebVitals from './reportWebVitals';
import StoreProvider from './redux/StoreProvider';
import { ClientProvider } from './client/ClientProvider';
import { ApiAccessTokenProvider } from './common/apiAccessTokenProvider';

const ENVS_WITH_SENTRY = ['staging', 'production'];

if (
  process.env.REACT_APP_ENVIRONMENT &&
  ENVS_WITH_SENTRY.includes(process.env.REACT_APP_ENVIRONMENT)
) {
  init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.REACT_APP_ENVIRONMENT,
  });
}

ReactDOM.render(
  <BrowserRouter>
    <ClientProvider>
      <StoreProvider>
        <ApiAccessTokenProvider>
          <App />
        </ApiAccessTokenProvider>
      </StoreProvider>
    </ClientProvider>
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
