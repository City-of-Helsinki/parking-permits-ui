import { ParkingContractType, ParkingStartType } from './enums';
import {
  ExtendedPriceListItem,
  Permit,
  PermitPriceChanges,
  Vehicle,
} from './permits';
import { UserAddress, UserProfile, Zone } from './user';

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

export type ParkingPermitError = {
  message: string;
};

export type PermitQueryResult = {
  getPermits: Permit[];
};

export type DeletePermitQueryResult = {
  deleteParkingPermit: boolean;
};

export type endPermitQueryResult = {
  endParkingPermit: boolean;
};

export type addTemporaryVehicle = {
  addTemporaryVehicle: boolean;
};

export type removeTemporaryVehicle = {
  removeTemporaryVehicle: boolean;
};
export type UpdatePermitQueryResult = {
  updateParkingPermit: Permit;
};

export type CreatePermitQueryResult = {
  createParkingPermit: Permit;
};

export type GetVehicleInformationQueryResult = {
  getVehicleInformation: Vehicle;
};

export type UpdatePermitVehicleQueryResult = {
  updatePermitVehicle: {
    checkoutUrl?: string;
  };
};

export type ExtendPermitResult = {
  checkoutUrl: string;
};

export type ExtendPermitQueryResult = {
  extendParkingPermit: ExtendPermitResult;
};

export type REG_ACTION = {
  id: string;
  key: string;
  value: ParkingStartType | ParkingContractType | Date | string | number;
};

export type createOrderQueryResult = {
  createOrder: {
    checkoutUrl: string;
  };
};

export type GetUpdateAddressPriceChangesResult = {
  getUpdateAddressPriceChanges: PermitPriceChanges[];
};

export type ChangeAddressResult = {
  changeAddress: {
    success: boolean;
    checkoutUrl?: string;
  };
};

export type UpdateLanguageResult = {
  updateLanguage: {
    language: string;
  };
};

export type ExtendedPriceListQueryResult = {
  getExtendedPriceList: ExtendedPriceListItem[];
};
