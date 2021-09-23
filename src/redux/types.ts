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
export const PARKING_PERMIT_TOKEN = 'parking_permit_token';

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
    success: boolean;
    errors: string[];
  };
};

export type DeletePermitQueryResult = {
  deleteParkingPermit: {
    success: boolean;
    errors: string[];
  };
};

export type UpdatePermitQueryResult = {
  updateParkingPermit: {
    permit: Permit;
    success: boolean;
    errors: string[];
  };
};

export type CreatePermitQueryResult = {
  createParkingPermit: {
    permit: Permit;
    success: boolean;
    errors: string[];
  };
};

export type Zone = {
  id: string;
  name: string;
  price: number;
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
  primary: boolean;
};

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  language: string;
  phoneNumber: string;
  primaryAddress: UserAddress;
  otherAddress: UserAddress;
  token: string;
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
  priceNet: number;
  priceVat: number;
  priceGross: number;
  vatPercentage: number;
}

export enum ParkingContractType {
  FIXED_PERIOD = 'FIXED_PERIOD',
  OPEN_ENDED = 'OPEN_ENDED',
}

export enum ParkingStartType {
  IMMEDIATELY = 'IMMEDIATELY',
  FROM = 'FROM',
}

export enum PermitStatus {
  DRAFT = 'DRAFT',
  VALID = 'VALID',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
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
  status: PermitStatus;
  primaryVehicle: boolean;
  vehicle: Vehicle;
  prices: Price;
  contractType: ParkingContractType;
  monthCount: number;
  parkingZone: Zone;
};

export type VehicleType = {
  id: string;
  type: string;
};

export type Vehicle = {
  id: string;
  emission: number;
  isLowEmission: boolean;
  vehicleType: VehicleType;
  manufacturer: string;
  model: string;
  productionYear: number;
  registrationNumber: string;
};

export enum STEPPER {
  VALID_PERMITS = 0,
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
  value: ParkingStartType | ParkingContractType | Date | string | number;
};

export type TalpaItem = {
  productId?: string;
  productName: string;
  quantity: number;
  unit: string;
  rowPriceNet: number;
  rowPriceVat: number;
  rowPriceTotal: number;
  startDate?: string;
  periodFrequency?: string;
  periodUnit?: string;
  vatPercentage: number;
  priceNet: number;
  priceVat: number;
  priceGross: number;
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
  priceNet: number;
  priceVat: number;
  priceTotal: number;
  checkoutUrl?: string;
  items?: TalpaItem[];
  customer: TalpaCustomer;
};
