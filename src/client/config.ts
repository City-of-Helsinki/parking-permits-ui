import { LoginProviderProps } from 'hds-react';
import { getLocationBasedUri } from '.';

const HDSLoginConfig: LoginProviderProps = {
  userManagerSettings: {
    authority: process.env.REACT_APP_OIDC_REALM
      ? `${process.env.REACT_APP_OIDC_URL}/auth/realms/${process.env.REACT_APP_OIDC_REALM}`
      : String(process.env.REACT_APP_OIDC_URL),
    client_id: String(process.env.REACT_APP_OIDC_CLIENT_ID),
    scope: process.env.REACT_APP_OIDC_SCOPE,
    redirect_uri: getLocationBasedUri(
      String(process.env.REACT_APP_OIDC_CALLBACK_PATH)
    ),
    silent_redirect_uri: getLocationBasedUri(
      process.env.REACT_APP_OIDC_SILENT_AUTH_PATH
    ),
    automaticSilentRenew: true,
    response_type: process.env.REACT_APP_OIDC_RESPONSE_TYPE,
    post_logout_redirect_uri: getLocationBasedUri(
      process.env.REACT_APP_OIDC_LOGOUT_PATH || '/'
    ),
  },
  apiTokensClientSettings: {
    url: `${process.env.REACT_APP_OIDC_URL}/auth/realms/${process.env.REACT_APP_OIDC_REALM}${process.env.REACT_APP_OIDC_TOKEN_EXCHANGE_PATH}`,
    queryProps: {
      grantType: 'urn:ietf:params:oauth:grant-type:uma-ticket',
      permission: '#access',
    },
    audiences: [
      String(process.env.REACT_APP_TOKEN_KEY),
      String(process.env.REACT_APP_PROFILE_TOKEN_KEY),
    ],
    maxRetries: 10,
    retryInterval: 1000,
  },
  sessionPollerSettings: { pollIntervalInMs: 10000 },
};

export default HDSLoginConfig;
