import { FeatureCollection, MultiPolygon, Position } from 'geojson';

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
  zone?: string;
  zoneFeatureCollection?: FeatureCollection<MultiPolygon>;
  zoneName?: string;
  coordinates?: Position;
};

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  language: string;
  addresses: UserAddress[];
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

export interface Price {
  original: number;
  offer: number;
  currency: string;
}

export enum ParkingDurationType {
  FIXED_PERIOD = 'fixedPeriod',
  OPEN_ENDED = 'openEnded',
}

export enum ParkingStartType {
  IMMEDIATELY = 'immediately',
  FROM = 'from',
}

export interface PermitCartState {
  selectedAddress?: UserAddress;
  currentStep: number;
  registrationNumbers?: string[];
  permits?: {
    [registrationNumber: string]: Permit;
  };
  fetchingStatus?: ProcessingStatus;
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

export type ValidityPeriod = {
  start: string | undefined;
  end: string | undefined;
};

export type StoreState = {
  permitCartState: PermitCartState;
  userState: UserState;
  helsinkiProfileState: HelsinkiUserProfileState;
};

export type Permit = {
  vehicle: Vehicle;
  prices: Price;
  validityPeriod?: ValidityPeriod;
  durationType?: ParkingDurationType;
  startType?: ParkingStartType;
  duration?: number;
  startDate?: Date;
};

export type Vehicle = {
  id: string;
  type: string;
  manufacturer: string;
  model: string;
  productionYear: number;
  registrationNumber: string | undefined;
  emission: number;
  primary?: boolean;
  ownerId?: string;
  holderId?: string;
  lastInspectionDate?: string;
};

export enum STEPPER {
  ADDRESS_SELECTOR = 1,
  VEHICLE_SELECTOR = 2,
  // eslint-disable-next-line no-magic-numbers
  PERMIT_PRICES = 2.2,
  DURATION_SELECTOR = 3,
  PURCHASED_VIEW = 4,
}

export type REG_ACTION = {
  id: string;
  key: string;
  value: ParkingStartType | ParkingDurationType | Date | string | number;
};
