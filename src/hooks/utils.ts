import { getClient } from '../client/oidc-react';
import { createGraphQLClient, GraphQLClient } from '../graphql/graphqlClient';
import { getEnv } from '../utils';

let gqlClient: GraphQLClient;

// eslint-disable-next-line import/prefer-default-export
export function getGqlClient(): GraphQLClient | undefined {
  if (!gqlClient) {
    const client = getClient();
    const tokens = client.getApiTokens();
    const parkingPermitsTokenKey = getEnv('REACT_APP_PARKING_PERMITS_AUDIENCE');
    const profileTokenKey = getEnv('REACT_APP_PROFILE_AUDIENCE');
    const parkingPermitsApiToken = tokens[parkingPermitsTokenKey];
    const helsinkiProfileApiToken = tokens[profileTokenKey];
    if (!parkingPermitsApiToken || !helsinkiProfileApiToken) {
      return undefined;
    }
    const uri = getEnv('REACT_APP_PROFILE_BACKEND_URL');
    gqlClient = createGraphQLClient(
      uri,
      parkingPermitsApiToken,
      helsinkiProfileApiToken
    );
  }
  return gqlClient;
}
