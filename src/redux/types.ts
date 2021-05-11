import { FeatureCollection, MultiPolygon, Point } from 'geojson';
import {
  ClientErrorObject,
  ClientStatusId,
  User,
  FetchStatus,
} from '../client/types';

import { GraphQLClientError } from '../graphql/graphqlClient';

export enum ProcessingStatus {
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export const CONNECTED_ACTION = 'CONNECTED_ACTION';

export type GraphQLNode = {
  id: string;
  primary: boolean;
  address: string;
  postalCode: string;
  city: string;
  countryCode: string;
  addressType: string;
  __typename: 'AddressNode';
};

export type GraphQLEdge = {
  node: GraphQLNode;
  __typename: 'AddressNodeEdge';
};

export type GraphQLAddress = {
  edges: GraphQLEdge[];
  __typename: 'AddressNodeConnection';
};

export type GraphQLProfile = {
  id: string;
  firstName: string;
  lastName: string;
  language: string;
  addresses: GraphQLAddress;
  __typename: 'ProfileNode';
};

export type ProfileQueryResult = {
  myProfile: GraphQLProfile;
};

export type UserAddress = {
  id: string;
  primary: boolean;
  address: string;
  postalCode: string;
  city: string;
  countryCode: string;
  addressType: string;
};

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  language: string;
  addresses: {
    [id: string]: UserAddress;
  };
};

export type ProfileActions = {
  getProfile: () => ProfileQueryResult;
  fetch: () => Promise<ProfileQueryResult | GraphQLClientError>;
  getStatus: () => FetchStatus;
  clear: () => Promise<void>;
  getErrorMessage: () => string | undefined;
  getResultErrorMessage: () => string | undefined;
};

export interface HelsinkiUserProfileState {
  fetchingStatus?: ProcessingStatus;
  profile: UserProfile;
  error?: Error;
}

export interface Features {
  [id: string]: FeatureCollection<MultiPolygon | Point>;
}

export interface PermitCartState {
  processingStatus?: ProcessingStatus;
  selectedAddressId?: string;
  registrationNumber?: string;
  currentStep: number;
}

export interface FeaturesState {
  fetchingStatus?: ProcessingStatus;
  features: Features;
  error?: Error;
}

export type UserState = {
  user?: User | undefined;
  status?: ClientStatusId;
  authenticated?: boolean;
  initialized?: boolean;
  loading?: boolean;
  error?: ClientErrorObject | undefined;
};

export type StoreState = {
  permitCartState: PermitCartState;
  userState: UserState;
  featuresState: FeaturesState;
  helsinkiProfileState: HelsinkiUserProfileState;
};

export type Vehicle = {
  id: string;
  type: string;
  manufacturer: string;
  model: string;
  productionYear: number;
  registrationNumber: string;
  emission: number;
  owner: string;
  holder: string;
};
