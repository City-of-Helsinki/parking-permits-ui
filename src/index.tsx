import { init } from '@sentry/browser';
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
