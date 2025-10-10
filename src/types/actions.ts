import { FetchStatus } from '../client/types';
import { UpdateLanguageResult } from './graphql';
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
  getLanguage: () => string | undefined;
  updateLanguage: (lang: string) => Promise<UpdateLanguageResult>;
};

export type PermitActions = {
  permitExists: (registration: string) => boolean;
  getPermits: () => Permit[];
  fetchPermits: () => Promise<void>;
  getValidPermits: () => Permit[];
  getDraftPermits: () => Permit[];
  getSelectedAddress: () => UserAddress;
  setSelectedAddress: (address: UserAddress) => void;
  getChangeAddressPriceChanges: (
    addressId: string
  ) => Promise<PermitPriceChanges[]>;
  permitsHaveOutdatedAddresses: () => boolean;
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
