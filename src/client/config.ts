import { LoginProviderProps } from 'hds-react';
import { getLocationBasedUri } from '.';

function envValueToBoolean(
  value: string | undefined | boolean,
  defaultValue: boolean
): boolean {
  const strValue = String(value).toLowerCase();
  if (
    value === false ||
    strValue === '' ||
    strValue === 'false' ||
    strValue === '0'
  ) {
    return false;
  }
  if (value === true || strValue === 'true' || strValue === '1') {
    return true;
  }
  return defaultValue;
}

const HDSLoginConfig: LoginProviderProps = {
  userManagerSettings: {
    authority: process.env.REACT_APP_OIDC_REALM
      ? `${process.env.REACT_APP_OIDC_URL}/realms/${process.env.REACT_APP_OIDC_REALM}`
      : String(process.env.REACT_APP_OIDC_URL),
    client_id: String(process.env.REACT_APP_OIDC_CLIENT_ID),
    scope: process.env.REACT_APP_OIDC_SCOPE,
    redirect_uri: getLocationBasedUri(
      String(process.env.REACT_APP_OIDC_CALLBACK_PATH)
    ),
    silent_redirect_uri: getLocationBasedUri(
      process.env.REACT_APP_OIDC_SILENT_AUTH_PATH
    ),
    automaticSilentRenew: envValueToBoolean(
      process.env.REACT_APP_OIDC_AUTO_SILENT_RENEW,
      true
    ),
    response_type: process.env.REACT_APP_OIDC_RESPONSE_TYPE,
    post_logout_redirect_uri: getLocationBasedUri(
      process.env.REACT_APP_OIDC_LOGOUT_PATH || '/'
    ),
  },
  apiTokensClientSettings: {
    url: `${process.env.REACT_APP_OIDC_URL}${process.env.REACT_APP_OIDC_TOKEN_EXCHANGE_PATH}`,
    maxRetries: 10,
    retryInterval: 1000,
  },
  sessionPollerSettings: { pollIntervalInMs: 10000 },
};

export default HDSLoginConfig;
