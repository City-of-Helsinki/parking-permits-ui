import * as Sentry from '@sentry/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './assets/styles/main.scss';
import HDSLoginProvider from './client/LoginProvider';
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
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
  });
}

const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(
  <BrowserRouter>
    <HDSLoginProvider>
      <UserProfileProvider>
        <PermitProvider>
          <App />
        </PermitProvider>
      </UserProfileProvider>
    </HDSLoginProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
