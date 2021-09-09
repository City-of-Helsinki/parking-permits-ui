// following ts-ignore + eslint-disable fixes "Could not find declaration file for module" error for await-handler
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import to from 'await-handler';
import {
  Client,
  ClientErrorObject,
  ClientEvent,
  ClientEventId,
  ClientFactory,
  ClientProps,
  ClientStatus,
  ClientStatusId,
  EventHandlers,
  EventListener,
  EventPayload,
  FetchError,
  JWTPayload,
  User,
} from './types';

export function createEventHandling(): EventHandlers {
  const listeners: Map<ClientEventId, Set<EventListener>> = new Map();
  const getListenerListForEventType = (
    eventType: ClientEventId
  ): Set<EventListener> => {
    if (!listeners.has(eventType)) {
      listeners.set(eventType, new Set());
    }
    return listeners.get(eventType) as Set<EventListener>;
  };

  const addListener: Client['addListener'] = (
    eventType,
    listener: EventListener
  ) => {
    const listenerList = getListenerListForEventType(eventType);
    listenerList.add(listener);
    return (): void => {
      const targetList = listeners.get(eventType);
      if (targetList) {
        targetList.delete(listener);
      }
    };
  };
  const eventTrigger = (
    eventType: ClientEventId,
    payload?: EventPayload
  ): void => {
    const source = listeners.get(eventType);
    if (source && source.size) {
      source.forEach(listener => listener(payload));
    }
  };
  return {
    addListener,
    eventTrigger,
  };
}

export function createClient(): ClientFactory {
  let status: ClientStatusId = ClientStatus.NONE;
  let error: ClientErrorObject;
  let user: User | undefined;
  const tokenStorage: JWTPayload = {};
  const { addListener, eventTrigger } = createEventHandling();

  const getStoredUser = (): User | undefined => user;

  const setStoredUser = (newUser: User | undefined): void => {
    user = newUser;
  };

  const getStatus: Client['getStatus'] = () => status;

  const getError: Client['getError'] = () => error;

  const isAuthenticated: Client['isAuthenticated'] = () =>
    status === ClientStatus.AUTHORIZED;

  const isInitialized: Client['isInitialized'] = () =>
    status === ClientStatus.AUTHORIZED || status === ClientStatus.UNAUTHORIZED;

  const setError: Client['setError'] = newError => {
    const oldType = error && error.type;
    const newType = newError && newError.type;
    if (oldType === newType) {
      return false;
    }
    error = newError;
    eventTrigger(ClientEvent.ERROR, error);
    return true;
  };

  const setStatus: Client['setStatus'] = newStatus => {
    if (newStatus === status) {
      return false;
    }
    status = newStatus;
    eventTrigger(ClientEvent.STATUS_CHANGE, status);
    return true;
  };

  const getApiTokens: ClientFactory['getApiTokens'] = () => tokenStorage;
  const addApiTokens: ClientFactory['addApiTokens'] = newToken => {
    Object.assign(tokenStorage, newToken);
    return tokenStorage;
  };
  const removeApiToken: ClientFactory['removeApiToken'] = name => {
    delete tokenStorage[name];
    return tokenStorage;
  };

  const fetchApiToken: ClientFactory['fetchApiToken'] = async options => {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${options.accessToken}`);
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    const urlencoded = new URLSearchParams();
    urlencoded.append('grant_type', options.grantType);
    urlencoded.append('audience', options.audience);
    urlencoded.append('permission', options.permission);

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
    };

    const [fetchError, fetchResponse] = await to(
      fetch(options.uri, requestOptions)
    );
    if (fetchError) {
      return {
        error: fetchError,
        message: 'Network or CORS error occured',
      } as FetchError;
    }
    if (!fetchResponse.ok) {
      return {
        status: fetchResponse.status,
        message: fetchResponse.statusText,
        error: new Error(fetchResponse.body),
      } as FetchError;
    }
    const [parseError, json] = await to(fetchResponse.json());
    if (parseError) {
      return {
        error: parseError,
        message: 'Returned data is not valid json',
      } as FetchError;
    }
    const jwt = json;
    addApiTokens(jwt);
    return jwt;
  };

  return {
    addListener,
    eventTrigger,
    getStatus,
    getError,
    getStoredUser,
    setStoredUser,
    setStatus,
    setError,
    isInitialized,
    isAuthenticated,
    fetchApiToken,
    getApiTokens,
    addApiTokens,
    removeApiToken,
  };
}

let config: ClientProps;

export function setClientConfig(newConfig: ClientProps): ClientProps {
  config = newConfig;
  return config;
}

export function getClientConfig(): ClientProps {
  return config;
}

export function hasValidClientConfig(): boolean {
  return !!(config && config.url && config.clientId);
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

export function getTokenUri(clientProps: ClientProps): string {
  if (clientProps.tokenExchangePath) {
    return `${clientProps.url}${clientProps.tokenExchangePath}`;
  }
  return `${clientProps.url}/realms/${clientProps.realm}/protocol/openid-connect/token`;
}

export function createClientGetOrLoadUserFunction({
  getUser,
  isInitialized,
  init,
}: Pick<Client, 'getUser' | 'isInitialized' | 'init'>): () => Promise<
  User | undefined | null
> {
  return () => {
    const currentUser = getUser();
    if (currentUser) {
      return Promise.resolve(currentUser);
    }
    if (isInitialized()) {
      return Promise.resolve(undefined);
    }
    return new Promise((resolve, reject) => {
      init()
        .then(() => resolve(getUser()))
        .catch(e => reject(e));
    });
  };
}
