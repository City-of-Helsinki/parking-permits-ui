import { GraphQLError } from 'graphql';
import { AnyObject } from '../common/types';
import { GraphQLClientError } from '../graphql/graphqlClient';
import { FetchStatus } from '../client/hooks';

export type ProfileDataType = string | AnyObject | undefined;
export type ProfileErrorType = Error | GraphQLClientError | string | undefined;
export type ProfileData = Record<string, ProfileDataType>;
export type ProfileQueryResult = {
  data: {
    myProfile: GraphQLProfile;
  };
  errors?: GraphQLError[];
};
export type GraphQLProfile =
  | Record<string, { edges: { node: { email: string } }[] }>
  | undefined;
export type ProfileActions = {
  getProfile: () => ProfileData | GraphQLClientError;
  fetch: () => Promise<ProfileData | GraphQLClientError>;
  getStatus: () => FetchStatus;
  clear: () => Promise<void>;
  getErrorMessage: () => string | undefined;
  getResultErrorMessage: () => string | undefined;
};
