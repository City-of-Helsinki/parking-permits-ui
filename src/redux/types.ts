import { ClientErrorObject, ClientStatusId, User } from '../client/types';

export type StoreState = {
  user: User | undefined;
  status: ClientStatusId;
  authenticated: boolean;
  initialized: boolean;
  error: ClientErrorObject | undefined;
};
