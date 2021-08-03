import { ApolloQueryResult } from '@apollo/client/core/types';

import { getClient } from '../client/oidc-react';
import { ProfileQueryResult, UserAddress, UserProfile } from './types';
import { GraphQLClient, createGraphQLClient } from '../graphql/graphqlClient';

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
  const profile = queryResult && queryResult.data && queryResult.data.myProfile;
  if (!profile) {
    return undefined;
  }
  const {
    id: userId,
    firstName,
    lastName,
    language,
    addresses,
    primaryEmail,
  } = profile;
  let profileAddress: UserAddress[] = [];
  if (addresses?.edges?.length) {
    profileAddress =
      addresses.edges.map(edge => ({
        id: edge.node.id,
        address: edge.node.address,
        addressType: edge.node.addressType,
        city: edge.node.city,
        countryCode: edge.node.countryCode,
        postalCode: edge.node.postalCode,
        primary: edge.node.primary,
      })) || [];
  }
  addresses.edges.forEach(edge => edge.node);
  return {
    id: userId,
    firstName,
    lastName,
    language,
    email: primaryEmail.email,
    addresses: profileAddress,
  };
}
