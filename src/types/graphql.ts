import { ParkingContractType, ParkingStartType } from './enums';
import { Permit, PermitPriceChanges, TalpaOrder, Vehicle } from './permits';
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
  getPermits: {
    permits: Permit[];
    success: boolean;
    errors: string | string[] | ParkingPermitError[];
  };
};

export type DeletePermitQueryResult = {
  deleteParkingPermit: {
    success: boolean;
    errors: string | string[] | ParkingPermitError[];
  };
};

export type endPermitQueryResult = {
  endParkingPermit: {
    success: boolean;
    errors: string | string[] | ParkingPermitError[];
  };
};

export type UpdatePermitQueryResult = {
  updateParkingPermit: {
    permits: Permit[];
    success: boolean;
    errors: string[];
  };
};

export type CreatePermitQueryResult = {
  createParkingPermit: {
    permits: Permit[];
    success: boolean;
    errors: string | string[] | ParkingPermitError[];
  };
};

export type UpdateVehicleQueryResult = {
  updateVehicle: {
    vehicle: Vehicle;
    success: boolean;
    errors: string | string[] | ParkingPermitError[];
  };
};

export type REG_ACTION = {
  id: string;
  key: string;
  value: ParkingStartType | ParkingContractType | Date | string | number;
};

export type createOrderQueryResult = {
  createOrder: {
    success: boolean;
    errors: string | string[] | ParkingPermitError[];
    order: TalpaOrder;
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
