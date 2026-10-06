import React from 'react';
import * as Sentry from '@sentry/react';
import { useLocation, useNavigate } from 'react-router';
import {
  LoginCallbackHandler,
  useOidcClient,
  OidcClientError,
} from 'hds-react';
import { ROUTES } from '../types';
import { isCallbackUrl } from './index';

const HandleCallback = (
  props: React.PropsWithChildren<unknown>
): React.ReactElement => {
  const location = useLocation();
  const { isAuthenticated } = useOidcClient();
  const navigate = useNavigate();
  const { children } = props;
  const isCallback = isCallbackUrl(location.pathname);

  const onSuccess = () => {
    navigate(ROUTES.BASE, { replace: true });
  };

  const onError = (error: OidcClientError | undefined) => {
    // eslint-disable-next-line no-console
    console.error(error);
    if (!error) return;
    if (
      error.isSignInError &&
      error.message ===
        'Current state (HANDLING_LOGIN_CALLBACK) cannot be handled by a callback'
    ) {
      // This is HDS issue, should be ignored
      return;
    }
    Sentry.captureException(error);
  };

  if (!isAuthenticated() && isCallback) {
    return (
      <LoginCallbackHandler onSuccess={onSuccess} onError={onError}>
        <div>Logging in...</div>
      </LoginCallbackHandler>
    );
  }
  return <>{children}</>;
};

export default HandleCallback;
