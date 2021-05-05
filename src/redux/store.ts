import {
  Action,
  applyMiddleware,
  combineReducers,
  compose,
  createStore,
} from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';

import { StoreState } from './types';
import userReducer from './reducers/user';
import featuresReducer from './reducers/features';
import helsinkiProfileReducer from './reducers/helsinkiProfile';
import { authorized, errorThrown, unauthorized } from './actions/user';
import { Client, ClientErrorObject, ClientEvent, User } from '../client/types';

// Ignore: The __REDUX_DEVTOOLS_EXTENSION_COMPOSE__ doesn't seem to have types available.
interface CustomWindow extends Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
}
const composeEnhancers =
  (process.env.NODE_ENV === 'development' &&
    window &&
    // eslint-disable-next-line no-underscore-dangle
    ((window as unknown) as CustomWindow)
      .__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;

const reducers = combineReducers({
  userState: userReducer,
  featuresState: featuresReducer,
  helsinkiProfileState: helsinkiProfileReducer,
});

export const store = createStore(
  reducers,
  composeEnhancers(
    applyMiddleware(thunk as ThunkMiddleware<StoreState, Action>)
  )
);

export const connectClient = (client: Client): void => {
  client.addListener(ClientEvent.AUTHORIZED, payload => {
    store.dispatch(authorized(payload as User));
  });
  client.addListener(ClientEvent.UNAUTHORIZED, () => {
    store.dispatch(unauthorized());
  });
  client.addListener(ClientEvent.ERROR, payload => {
    store.dispatch(errorThrown(payload as ClientErrorObject));
  });
};
