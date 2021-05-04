import {
  Client,
  ClientErrorObject,
  ClientEvent,
  EventPayload,
  User,
} from '../../client/types';
import { CONNECTED_ACTION } from '../types';

type Action = {
  type: string;
  payload?: EventPayload;
};

export const connected = (client: Client): Action => ({
  type: CONNECTED_ACTION,
  payload: client,
});

export const authorized = (user: User): Action => ({
  type: ClientEvent.AUTHORIZED,
  payload: user,
});

export const unauthorized = (): Action => ({
  type: ClientEvent.UNAUTHORIZED,
});

export const errorThrown = (error: ClientErrorObject): Action => ({
  type: ClientEvent.ERROR,
  payload: error,
});
