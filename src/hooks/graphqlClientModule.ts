import {
  Beacon,
  ConnectedModule,
  createTriggerPropsForAllApiTokensClientSignals,
  Disposer,
  isApiTokensRemovedSignal,
  isApiTokensUpdatedSignal,
  SignalListener,
  TokenData,
  useConnectedModule,
  getApiTokensClientEventPayload,
} from 'hds-react';
import {
  ApolloClient,
  ApolloLink,
  from,
  DefaultOptions,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { getEnv } from '../utils';

import { FetchError } from '../client/types';
import i18n from '../i18n/i18n';

export type GraphQLClient = ApolloClient<NormalizedCacheObject>;
export type GraphQLClientError = Pick<FetchError, 'error' | 'message'>;
type GraphQLClientModule = ConnectedModule & {
  getClient: () => GraphQLClient;
  resetClient: () => Promise<void>;
};

let gqlClient: GraphQLClient;

const defaultOptions: DefaultOptions = {
  mutate: {
    errorPolicy: 'all',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
};

export function createGraphQLClient(
  uri: string,
  apiTokensLink: ApolloLink
): GraphQLClient {
  const httpLink = new HttpLink({ uri });
  const languageLink = new ApolloLink((operation, forward) => {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        'Content-Language': i18n.language,
        'Accept-Language': i18n.language,
      },
    }));
    return forward(operation);
  });
  return new ApolloClient({
    defaultOptions,
    cache: new InMemoryCache(),
    link: from([apiTokensLink, languageLink, httpLink]),
  });
}

function getNamedTokens(tokens: TokenData) {
  if (!tokens) {
    return undefined;
  }
  const parkingPermitsTokenKey = getEnv('REACT_APP_TOKEN_KEY');
  const profileTokenKey = getEnv('REACT_APP_PROFILE_TOKEN_KEY');
  const parkingPermitsApiToken = tokens[parkingPermitsTokenKey];
  const helsinkiProfileApiToken = tokens[profileTokenKey];
  return {
    parkingPermitsApiToken,
    helsinkiProfileApiToken,
  };
}

const namespace = 'graphQLClientModule';
// eslint-disable-next-line import/prefer-default-export
export function createGraphQLClientModule(): GraphQLClientModule {
  let beacon: Beacon | undefined;
  const uri = getEnv('REACT_APP_PARKING_PERMITS_BACKEND_URL');
  const tokens = {
    parkingPermitsApiToken: '',
    helsinkiProfileApiToken: '',
  };

  const authLink = new ApolloLink((operation, forward) => {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        Authorization: `Bearer ${tokens.parkingPermitsApiToken}`,
        'X-Authorization': `Bearer ${tokens.helsinkiProfileApiToken}`,
      },
    }));
    return forward(operation);
  });

  const client = createGraphQLClient(uri, authLink);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  gqlClient = client;
  const listener: SignalListener = signal => {
    if (isApiTokensUpdatedSignal(signal)) {
      const payload = getApiTokensClientEventPayload(signal);
      const newTokens = getNamedTokens(payload?.data as TokenData);
      tokens.helsinkiProfileApiToken = newTokens
        ? newTokens.helsinkiProfileApiToken
        : '';
      tokens.parkingPermitsApiToken = newTokens
        ? newTokens.parkingPermitsApiToken
        : '';
      //
    } else if (isApiTokensRemovedSignal(signal)) {
      // ignoring removal and keeping old tokens until renewed.
    }
  };
  let listenerDisposer: Disposer;
  return {
    namespace,
    connect: connectedBeacon => {
      // connect may be called twice if StrictMode
      // or LoginProvider is nested inside another context
      if (listenerDisposer) {
        listenerDisposer();
      }
      beacon = connectedBeacon;
      listenerDisposer = beacon.addListener(
        createTriggerPropsForAllApiTokensClientSignals(),
        listener
      );
    },
    getClient: () => client,
    resetClient: async () => {
      client.stop();
      await client.resetStore();
    },
  };
}

// hook to get the client
export function useGraphQLClient(): GraphQLClient {
  const module = useConnectedModule<GraphQLClientModule>(namespace);
  if (!module) {
    throw new Error('Cannot find graphQLModule from LoginContext.');
  }
  return module.getClient();
}

// function to get the stored client
export function getGqlClient(): GraphQLClient | undefined {
  return gqlClient;
}
