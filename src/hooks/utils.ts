import { getApiTokensFromStorage } from 'hds-react';
import { createGraphQLClient, GraphQLClient } from '../graphql/graphqlClient';
import { getEnv } from '../utils';

let gqlClient: GraphQLClient;

// eslint-disable-next-line import/prefer-default-export
export function getGqlClient(): GraphQLClient | undefined {
  if (!gqlClient) {
    const tokens = getApiTokensFromStorage();
    const parkingPermitsTokenKey = getEnv('REACT_APP_PARKING_PERMITS_AUDIENCE');
    const profileTokenKey = getEnv('REACT_APP_PROFILE_AUDIENCE');

    if (!tokens) {
      return undefined;
    }

    const parkingPermitsApiToken = tokens[parkingPermitsTokenKey];
    const helsinkiProfileApiToken = tokens[profileTokenKey];
    if (!parkingPermitsApiToken || !helsinkiProfileApiToken) {
      return undefined;
    }
    const uri = getEnv('REACT_APP_PARKING_PERMITS_BACKEND_URL');
    gqlClient = createGraphQLClient(
      uri,
      parkingPermitsApiToken,
      helsinkiProfileApiToken
    );
  }
  return gqlClient;
}
