import { LoginProviderProps } from 'hds-react';

let HDSconfig: LoginProviderProps;

export function setHDSClientConfig(
  newConfig: LoginProviderProps
): LoginProviderProps {
  HDSconfig = newConfig;
  return HDSconfig;
}

export function getHDSClientConfig(): LoginProviderProps {
  return HDSconfig;
}

export function getLocationBasedUri(
  property: string | undefined
): string | undefined {
  const location = window.location.origin;
  if (property === undefined) {
    return undefined;
  }
  return `${location}${property}`;
}

export function isCallbackUrl(url: string): boolean {
  return url === process.env.REACT_APP_OIDC_CALLBACK_PATH;
}
