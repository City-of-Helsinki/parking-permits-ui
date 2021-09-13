import { FeatureCollection, MultiPolygon, Position } from 'geojson';
import {
  ClientErrorObject,
  ClientStatusId,
  FetchStatus,
  User,
} from '../client/types';
import { GraphQLClientError } from '../graphql/graphqlClient';

export enum ProcessingStatus {
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export const CONNECTED_ACTION = 'CONNECTED_ACTION';

export type GraphQLZone = Zone & {
  __typename: 'ZoneNode';
};

export type GraphQLAddress = UserAddress & {
  __typename: 'AddressNode';
};

export type GraphQLProfile = UserProfile & {
  __typename: 'CustomerNode';
};

export type ProfileQueryResult = {
  profile: GraphQLProfile;
};

export type PermitQueryResult = {
  getPermits: {
    permits: Permit[];
  };
};

export type Zone = {
  id: string;
  name: string;
  sharedProductId: string;
  description: string;
  descriptionSv: string;
  location: FeatureCollection<MultiPolygon>;
};

export type UserAddress = {
  id: string;
  streetName: string;
  streetNameSv: string;
  streetNumber: number;
  city: string;
  citySv: string;
  postalCode: string;
  location?: Position;
  zone?: Zone;
};

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  language: string;
  phoneNumber: string;
  primaryAddress: GraphQLAddress;
  otherAddress: GraphQLAddress;
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

export interface TalpaState {
  fetchingStatus?: ProcessingStatus;
  order?: TalpaOrder;
  error?: Error;
}

export interface Price {
  original: number;
  offer: number;
  currency: string;
}

export enum ParkingDurationType {
  FIXED_PERIOD = 'FIXED_PERIOD',
  OPEN_ENDED = 'OPEN_ENDED',
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

export type StoreState = {
  permitCartState: PermitCartState;
  userState: UserState;
  talpaState: TalpaState;
  helsinkiProfileState: HelsinkiUserProfileState;
};

export type Permit = {
  id: string;
  startType?: ParkingStartType;
  startTime?: Date | string;
  status: string;
  primaryVehicle: boolean;
  vehicle: Vehicle;
  price: Price;
  contractType: ParkingDurationType;
  monthCount: number;
};

export type VehicleType = {
  id: string;
  type: string;
};

export type Vehicle = {
  id: string;
  emission: number;
  vehicleType: VehicleType;
  manufacturer: string;
  model: string;
  productionYear: number;
  registrationNumber: string;
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

export type TalpaItem = {
  productId?: string;
  productName: string;
  quantity: number;
  unit: string;
  rowPriceNet: string;
  rowPriceVat: string;
  rowPriceTotal: string;
  startDate?: string;
  periodFrequency?: string;
  periodUnit?: string;
  vatPercentage: string;
  priceNet: string;
  priceVat: string;
  priceGross: string;
  meta: TalpaMeta[];
};

export type TalpaCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type TalpaMeta = {
  key: string;
  value: string;
  label?: string;
  ordinal?: number;
  visibleInCheckout?: boolean;
};

export type TalpaOrder = {
  namespace: string;
  user: string;
  priceNet: string;
  priceVat: string;
  priceTotal: string;
  items?: TalpaItem[];
  customer: TalpaCustomer;
};
