import { ApolloQueryResult } from '@apollo/client/core/types';
import { getClient } from '../client/oidc-react';
import { createGraphQLClient, GraphQLClient } from '../graphql/graphqlClient';
import { ProfileQueryResult, UserProfile } from './types';

let profileGqlClient: GraphQLClient;

export function getProfileApiToken(): string | undefined {
  const client = getClient();
  const tokenKey = process.env.REACT_APP_PROFILE_AUDIENCE;
  if (!tokenKey) {
    return undefined;
  }
  const apiTokens = client.getApiTokens();
  return apiTokens[tokenKey];
}

export function getProfileGqlClient(): GraphQLClient | undefined {
  if (!profileGqlClient) {
    const token = getProfileApiToken();
    const uri = process.env.REACT_APP_PROFILE_BACKEND_URL;
    if (!token || !uri) {
      return undefined;
    }
    profileGqlClient = createGraphQLClient(uri, token);
  }
  return profileGqlClient;
}

export function convertQueryToData(
  queryResult: ApolloQueryResult<ProfileQueryResult>
): UserProfile | undefined {
  const profile = queryResult && queryResult.data && queryResult.data.profile;
  if (!profile) {
    return undefined;
  }
  return profile;
}
