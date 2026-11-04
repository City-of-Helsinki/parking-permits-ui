import { LoginProviderProps } from 'hds-react';
import { getLocationBasedUri } from '.';

const HDSLoginConfig: LoginProviderProps = {
  userManagerSettings: {
    authority: import.meta.env.REACT_APP_OIDC_REALM
      ? `${import.meta.env.REACT_APP_OIDC_URL}/auth/realms/${
          import.meta.env.REACT_APP_OIDC_REALM
        }`
      : String(import.meta.env.REACT_APP_OIDC_URL),
    client_id: String(import.meta.env.REACT_APP_OIDC_CLIENT_ID),
    scope: import.meta.env.REACT_APP_OIDC_SCOPE,
    redirect_uri: getLocationBasedUri(
      String(import.meta.env.REACT_APP_OIDC_CALLBACK_PATH)
    ),
    silent_redirect_uri: getLocationBasedUri(
      import.meta.env.REACT_APP_OIDC_SILENT_AUTH_PATH
    ),
    automaticSilentRenew: true,
    response_type: import.meta.env.REACT_APP_OIDC_RESPONSE_TYPE,
    post_logout_redirect_uri: getLocationBasedUri(
      import.meta.env.REACT_APP_OIDC_LOGOUT_PATH || '/'
    ),
  },
  apiTokensClientSettings: {
    url: `${import.meta.env.REACT_APP_OIDC_URL}/auth/realms/${
      import.meta.env.REACT_APP_OIDC_REALM
    }${import.meta.env.REACT_APP_OIDC_TOKEN_EXCHANGE_PATH}`,
    queryProps: {
      grantType: 'urn:ietf:params:oauth:grant-type:uma-ticket',
      permission: '#access',
    },
    audiences: [
      String(import.meta.env.REACT_APP_TOKEN_KEY),
      String(import.meta.env.REACT_APP_PROFILE_TOKEN_KEY),
    ],
    maxRetries: 10,
    retryInterval: 1000,
  },
  sessionPollerSettings: { pollIntervalInMs: 10000 },
};

export default HDSLoginConfig;
