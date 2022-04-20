import {
  ApolloClient,
  ApolloLink,
  concat,
  DefaultOptions,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { FetchError } from '../client/types';
import i18n from '../i18n/i18n';

export type GraphQLClient = ApolloClient<NormalizedCacheObject>;
export type GraphQLClientError = Pick<FetchError, 'error' | 'message'>;

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
  parkingPermitsApiToken: string,
  helsinkiProfileApiToken: string
): GraphQLClient {
  const httpLink = new HttpLink({ uri });
  const authLink = new ApolloLink((operation, forward) => {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        Authorization: `Bearer ${parkingPermitsApiToken}`,
        'X-Authorization': `Bearer ${helsinkiProfileApiToken}`,
        'Content-Language': i18n.language,
        'Accept-Language': i18n.language,
      },
    }));
    return forward(operation);
  });
  return new ApolloClient({
    defaultOptions,
    cache: new InMemoryCache(),
    link: concat(authLink, httpLink),
  });
}

export async function resetClient(graphQLClient: GraphQLClient): Promise<void> {
  graphQLClient.stop();
  await graphQLClient.resetStore();
}
