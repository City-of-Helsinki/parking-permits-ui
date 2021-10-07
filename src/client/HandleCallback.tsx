import React from 'react';
import { useLocation } from 'react-router';
import { ROUTES } from '../types';
import { isCallbackUrl } from './index';
import { getClient } from './oidc-react';
import OidcCallback from './OidcCallback';

const HandleCallback = (
  props: React.PropsWithChildren<unknown>
): React.ReactElement => {
  const location = useLocation();
  const client = getClient();
  const { children } = props;
  const isCallback = isCallbackUrl(location.pathname);
  if (!client.isAuthenticated() && isCallback) {
    return (
      <OidcCallback
        successRedirect={ROUTES.BASE}
        failureRedirect={ROUTES.BASE}
      />
    );
  }
  return <>{children}</>;
};

export default HandleCallback;
