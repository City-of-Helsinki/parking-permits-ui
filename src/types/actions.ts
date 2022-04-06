import { FetchStatus } from '../client/types';
import { Permit, PermitPriceChanges } from './permits';
import { UserAddress, UserProfile, Zone } from './user';

export type ProfileActions = {
  getProfile: () => UserProfile;
  getAddresses: () => UserAddress[];
  fetch: () => Promise<void>;
  getStatus: () => FetchStatus;
  clear: () => Promise<void>;
  getErrorMessage: () => string | undefined;
  getResultErrorMessage: () => string | undefined;
};

export type PermitActions = {
  getPermits: () => Permit[];
  getValidPermits: () => Permit[];
  getDraftPermits: () => Permit[];
  getSelectedAddress: () => UserAddress;
  setSelectedAddress: (address: UserAddress) => void;
  getChangeAddressPriceChanges: (
    addressId: string
  ) => Promise<PermitPriceChanges[]>;
  changeAddress: (addressId: string, iban?: string) => Promise<void>;
  updatePermit: (
    payload: Partial<Permit> | Partial<Zone>,
    permitId?: string
  ) => Promise<void>;
  createPermit: (registration: string) => Promise<void>;
  createOrderRequest: () => Promise<void>;
  deletePermit: (permitId: string) => Promise<void>;
  endValidPermits: (
    permitIds: string[],
    endType: string,
    iban: string
  ) => Promise<void>;
  getStep: () => number;
  setStep: (step: number) => void;
  getStatus: () => FetchStatus;
  clearErrorMessage: () => void;
  getErrorMessage: () => string | undefined;
  getResultErrorMessage: () => string | undefined;
};
