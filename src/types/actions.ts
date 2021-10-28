import { FetchStatus } from '../client/types';
import { Permit } from './permits';
import { UserAddress, UserProfile } from './user';

export type ProfileActions = {
  getProfile: () => UserProfile;
  fetch: () => Promise<void>;
  getStatus: () => FetchStatus;
  clear: () => Promise<void>;
  getErrorMessage: () => string | undefined;
  getResultErrorMessage: () => string | undefined;
};

export type PermitActions = {
  getValidPermits: () => Permit[];
  getDraftPermits: () => Permit[];
  getAddress: () => UserAddress;
  setAddress: (address: UserAddress) => void;
  updatePermit: (payload: Partial<Permit>, permitId?: string) => Promise<void>;
  updateVehicle: (permitId: string, registration: string) => Promise<void>;
  createPermit: () => Promise<void>;
  proceedToTalpa: () => Promise<void>;
  deletePermit: (permitId: string) => Promise<void>;
  getStep: () => number;
  setStep: (step: number) => void;
  getStatus: () => FetchStatus;
  clear: () => Promise<void>;
  getErrorMessage: () => string | undefined;
  getResultErrorMessage: () => string | undefined;
};
