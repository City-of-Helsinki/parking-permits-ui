import { isEmpty } from 'lodash';
import React, { createContext, useEffect, useRef, useState } from 'react';
import { getEnv } from '../utils';
import { getClient } from './oidc-react';
import {
  ApiAccessTokenActions,
  ApiFetchError,
  Client,
  ClientError,
  ClientErrorObject,
  ClientEvent,
  ClientStatus,
  ClientStatusId,
  FetchStatus,
  JWTPayload,
} from './types';

export function useClient(): Client {
  const clientRef: React.Ref<Client> = useRef(getClient());
  const clientFromRef: Client = clientRef.current as Client;
  const [, setStatus] = useState<ClientStatusId>(clientFromRef.getStatus());
  useEffect(() => {
    const initClient = async (): Promise<void> => {
      if (!clientFromRef.isInitialized()) {
        await clientFromRef.getOrLoadUser().catch(e => {
          clientFromRef.setError({
            type: ClientError.INIT_ERROR,
            message: e && e.toString(),
          });
        });
      }
    };
    const statusListenerDisposer = clientFromRef.addListener(
      ClientEvent.STATUS_CHANGE,
      status => {
        setStatus(status as ClientStatusId);
      }
    );

    initClient();
    return (): void => {
      statusListenerDisposer();
    };
  }, [clientFromRef]);
  return clientFromRef;
}

export function useClientErrorDetection(): ClientErrorObject {
  const clientRef: React.Ref<Client> = useRef(getClient());
  const clientFromRef: Client = clientRef.current as Client;
  const [error, setError] = useState<ClientErrorObject>(undefined);
  useEffect(() => {
    let isAuthorized = false;
    const statusListenerDisposer = clientFromRef.addListener(
      ClientEvent.STATUS_CHANGE,
      status => {
        if (status === ClientStatus.AUTHORIZED) {
          isAuthorized = true;
        }
        if (isAuthorized && status === ClientStatus.UNAUTHORIZED) {
          setError({ type: ClientError.UNEXPECTED_AUTH_CHANGE, message: '' });
          isAuthorized = false;
        }
      }
    );

    const errorListenerDisposer = clientFromRef.addListener(
      ClientEvent.ERROR,
      newError => {
        setError(newError as ClientErrorObject);
      }
    );
    const logoutListenerDisposer = clientFromRef.addListener(
      ClientEvent.LOGGING_OUT,
      (): void => {
        isAuthorized = false;
      }
    );

    return (): void => {
      errorListenerDisposer();
      statusListenerDisposer();
      logoutListenerDisposer();
    };
  }, [clientFromRef]);
  return error;
}

export function useClientCallback(): Client {
  const clientRef: React.Ref<Client> = useRef(getClient());
  const clientFromRef: Client = clientRef.current as Client;
  const [, setStatus] = useState<ClientStatusId>(clientFromRef.getStatus());
  useEffect(() => {
    const initClient = async (): Promise<void> => {
      if (clientFromRef.isInitialized()) {
        throw new Error(
          'Client already initialized. This should not happen with callback. When using callback, client should not be initialized more than once.'
        );
      }
      await clientFromRef.handleCallback().catch(e =>
        clientFromRef.setError({
          type: ClientError.INIT_ERROR,
          message: e && e.toString(),
        })
      );
    };
    const statusListenerDisposer = clientFromRef.addListener(
      ClientEvent.STATUS_CHANGE,
      status => {
        setStatus(status as ClientStatusId);
      }
    );

    initClient();
    return (): void => {
      statusListenerDisposer();
    };
  }, [clientFromRef]);
  return clientFromRef;
}

export const ApiAccessTokenActionsContext =
  createContext<ApiAccessTokenActions | null>(null);

export function useApiAccessTokens(): ApiAccessTokenActions {
  const client = useClient();
  const tokens = client.isAuthenticated() ? client.getApiTokens() : undefined;
  const hasTokens = tokens && Object.keys(tokens).length;
  const [apiTokens, setApiTokens] = useState<JWTPayload | undefined>(
    hasTokens ? tokens : undefined
  );

  const resolveStatus = (): FetchStatus => {
    if (!client.isAuthenticated()) {
      return 'unauthorized';
    }
    if (apiTokens) {
      return 'loaded';
    }
    return 'ready';
  };

  const resolveCurrentStatus = (
    baseStatus: FetchStatus,
    stateStatus: FetchStatus
  ): FetchStatus => {
    if (stateStatus === 'unauthorized' || baseStatus === 'unauthorized') {
      return baseStatus;
    }
    return stateStatus;
  };

  const resolvedStatus = resolveStatus();
  const [status, setStatus] = useState<FetchStatus>(resolvedStatus);
  const [error, setError] = useState<ApiFetchError>();
  const currentStatus = resolveCurrentStatus(resolvedStatus, status);
  if (resolvedStatus === 'unauthorized' && apiTokens) {
    setApiTokens(undefined);
    setStatus('unauthorized');
  }
  const hasApiTokens = !isEmpty(apiTokens);

  useEffect(() => {
    const autoFetch = async (): Promise<void> => {
      const options = {
        audience: getEnv('REACT_APP_PARKING_PERMITS_AUDIENCE'),
        permission: getEnv('REACT_APP_PARKING_PERMITS_PERMISSION'),
        grantType: getEnv('REACT_APP_PARKING_PERMITS_GRANT_TYPE'),
      };
      setStatus('loading');
      const result = await client.getApiAccessToken(options);
      if (result.error) {
        setStatus('error');
        setError(
          result.message
            ? new Error(`${result.message} ${result.status}`)
            : result.error
        );
      } else {
        setError(undefined);
        setApiTokens(result as JWTPayload);
        setStatus('loaded');
      }
    };
    if (currentStatus === 'ready' && !hasApiTokens) {
      autoFetch();
    }
  }, [client, currentStatus, hasApiTokens]);

  return {
    getStatus: () => status,
    getErrorMessage: () => {
      if (!error) {
        return undefined;
      }
      if (typeof error === 'string') {
        return error;
      }
      if (error.message) {
        return error.message;
      }
      return undefined;
    },
    getTokens: () => apiTokens,
  } as ApiAccessTokenActions;
}
