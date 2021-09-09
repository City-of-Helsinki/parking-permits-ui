import { Reducer } from 'redux';
import { Client, ClientEvent, ClientStatus } from '../../client/types';
import { CONNECTED_ACTION, UserState } from '../types';

const initialState: UserState = {
  user: undefined,
  status: ClientStatus.NONE,
  authenticated: false,
  initialized: false,
  error: undefined,
};

const userReducer: Reducer = (
  state: UserState = initialState,
  action
): UserState => {
  switch (action.type) {
    case CONNECTED_ACTION:
      const client: Client = action.payload;
      const status = client.getStatus();
      const authenticated = client.isAuthenticated();
      const initialized = client.isInitialized();
      return {
        ...state,
        user: undefined,
        status,
        authenticated,
        initialized,
      };
    case ClientEvent.TOKEN_EXPIRED:
      return {
        ...state,
        user: undefined,
        status: ClientStatus.UNAUTHORIZED,
      };
    case ClientEvent.ERROR:
      return { ...state, error: action.payload };
    case ClientEvent.UNAUTHORIZED:
      return {
        ...state,
        user: undefined,
        status: ClientStatus.UNAUTHORIZED,
        initialized: true,
        authenticated: false,
      };
    case ClientEvent.AUTHORIZED:
      return {
        ...state,
        user: action.payload,
        status: ClientStatus.AUTHORIZED,
        initialized: true,
        authenticated: true,
      };
    case ClientEvent.INITIALIZING:
      return {
        ...state,
        status: ClientStatus.INITIALIZING,
        initialized: false,
      };
    default:
      return state;
  }
};

export default userReducer;
