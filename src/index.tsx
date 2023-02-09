import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './assets/styles/main.scss';
import { ClientProvider } from './client/ClientProvider';
import HandleCallback from './client/HandleCallback';
import { ApiAccessTokenProvider } from './hooks/apiAccessTokenProvider';
import { PermitProvider } from './hooks/permitProvider';
import { UserProfileProvider } from './hooks/userProfileProvider';
import './i18n/i18n';
import reportWebVitals from './reportWebVitals';

const ENVS_WITH_SENTRY = ['test', 'stage', 'prod'];

if (
  process.env.REACT_APP_SENTRY_ENVIRONMENT &&
  ENVS_WITH_SENTRY.includes(process.env.REACT_APP_SENTRY_ENVIRONMENT)
) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.REACT_APP_SENTRY_ENVIRONMENT,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}

ReactDOM.render(
  <BrowserRouter>
    <HandleCallback>
      <ClientProvider>
        <ApiAccessTokenProvider>
          <UserProfileProvider>
            <PermitProvider>
              <App />
            </PermitProvider>
          </UserProfileProvider>
        </ApiAccessTokenProvider>
      </ClientProvider>
    </HandleCallback>
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
