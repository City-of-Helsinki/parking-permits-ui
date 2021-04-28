export type User = Record<string, string | number | boolean>;
export type Token = string | undefined;
export type JWTPayload = Record<string, string>;
export type EventPayload =
  | User
  | undefined
  | Client
  | ClientStatusId
  | ClientErrorObject;
export type EventListener = (payload?: EventPayload) => void;
export type Client = {
  init: () => Promise<User | undefined | null>;
  login: () => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isInitialized: () => boolean;
  clearSession: () => void;
  handleCallback: () => Promise<User | undefined | Error>;
  getUser: () => User | undefined;
  getOrLoadUser: () => Promise<User | undefined | null>;
  loadUserProfile: () => Promise<User>;
  getStatus: () => ClientStatusId;
  setStatus: (newStatus: ClientStatusId) => boolean;
  getError: () => ClientErrorObject;
  setError: (newError?: ClientErrorObject) => boolean;
  getUserProfile: () => User | undefined;
  addListener: (
    eventType: ClientEventId,
    listener: EventListener
  ) => () => void;
  onAuthChange: (authenticated: boolean) => boolean;
  getApiAccessToken: (
    options: FetchApiTokenOptions
  ) => Promise<JWTPayload | FetchError>;
  getApiTokens: () => JWTPayload;
  addApiTokens: (newToken: JWTPayload) => JWTPayload;
  removeApiToken: (name: string) => JWTPayload;
  getUserTokens: () => Record<string, string | undefined> | undefined;
};

export const ClientStatus = {
  NONE: 'NONE',
  INITIALIZING: 'INITIALIZING',
  AUTHORIZED: 'AUTHORIZED',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const;

export type ClientStatusId = typeof ClientStatus[keyof typeof ClientStatus];

export type FetchApiTokenOptions = {
  grantType: string;
  audience: string;
  permission: string;
};

export type FetchApiTokenConfiguration = FetchApiTokenOptions & {
  uri: string;
  accessToken: string;
};

export type FetchError = {
  status?: number;
  error?: Error;
  message?: string;
};

export const ClientEvent = {
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_EXPIRING: 'TOKEN_EXPIRING',
  ERROR: 'ERROR',
  STATUS_CHANGE: 'STATUS_CHANGE',
  AUTHORIZATION_TERMINATED: 'AUTHORIZATION_TERMINATED',
  LOGGING_OUT: 'LOGGING_OUT',
  CLIENT_AUTH_SUCCESS: 'CLIENT_AUTH_SUCCESS',
  ...ClientStatus,
} as const;

export type ClientEventId = typeof ClientEvent[keyof typeof ClientEvent];

export const ClientError = {
  INIT_ERROR: 'INIT_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  AUTH_REFRESH_ERROR: 'AUTH_REFRESH_ERROR',
  LOAD_ERROR: 'LOAD_ERROR',
  UNEXPECTED_AUTH_CHANGE: 'UNEXPECTED_AUTH_CHANGE',
  USER_DATA_ERROR: 'USER_DATA_ERROR',
} as const;

export type ClientErrorObject = { type: string; message: string } | undefined;

export interface ClientProps {
  /**
   * realm for the OIDC/OAuth2 endpoint
   */
  realm: string;
  /**
   * The URL of the OIDC/OAuth2 endpoint
   */
  url: string;
  /**
   * authority for the OIDC/OAuth2. Not configurable, value is props.url+'/realms/'+props.realm
   */
  authority: string;
  /**
   * Your client application's identifier as registered with the OIDC/OAuth2 provider.
   */
  clientId: string;
  /**
   * The redirect URI of your client application to receive a response from the OIDC/OAuth2 provider.
   */
  callbackPath: string;
  /**
   * The redirect URI of your client application after logout
   * Default: '/'
   */
  logoutPath?: string;
  /**
   * The path for silent authentication checks
   * Default '/silent-renew.html'
   */
  silentAuthPath?: string;
  /**
   * The type of response desired from the OIDC/OAuth2 provider.
   */
  responseType?: string;
  /**
   * The scope being requested from the OIDC/OAuth2 provider.
   */
  scope?: string;
  /**
   * Default: true
   */
  autoSignIn?: boolean;
  /**
   * Default: true
   */
  automaticSilentRenew?: boolean;
  /**
   * Default: false
   */
  enableLogging?: boolean;
  /**
   * Path for exchanging tokens. Leave blank to use default keycloak path realms/<realm>/protocol/openid-connect/token
   */
  tokenExchangePath?: string;
}

export type EventHandlers = {
  addListener: Client['addListener'];
  eventTrigger: (eventType: ClientEventId, payload?: EventPayload) => void;
};

export type ClientFactory = {
  addListener: Client['addListener'];
  eventTrigger: EventHandlers['eventTrigger'];
  getStoredUser: () => User | undefined;
  setStoredUser: (newUser: User | undefined) => void;
  getStatus: Client['getStatus'];
  setStatus: Client['setStatus'];
  getError: Client['getError'];
  setError: Client['setError'];
  isInitialized: Client['isInitialized'];
  isAuthenticated: Client['isAuthenticated'];
  fetchApiToken: (
    options: FetchApiTokenConfiguration
  ) => Promise<JWTPayload | FetchError>;
  getApiTokens: Client['getApiTokens'];
  addApiTokens: Client['addApiTokens'];
  removeApiToken: Client['removeApiToken'];
} & EventHandlers;

export type FetchStatus =
  | 'unauthorized'
  | 'ready'
  | 'loading'
  | 'error'
  | 'loaded'
  | 'waiting';

export type ApiFetchError = FetchError | string | undefined;

export type ApiAccessTokenActions = {
  fetch: (options: FetchApiTokenOptions) => Promise<JWTPayload | FetchError>;
  getStatus: () => FetchStatus;
  getErrorMessage: () => string | undefined;
  getTokens: () => JWTPayload | undefined;
};
