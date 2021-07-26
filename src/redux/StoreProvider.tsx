import { Provider } from 'react-redux';
import React, { useEffect, FC } from 'react';

import { connected } from './actions/user';
import { useClient } from '../client/hooks';
import { store, connectClient } from './store';

const StoreProvider: FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const client = useClient();
  useEffect(() => {
    connectClient(client);
    store.dispatch(connected(client));
  }, [client]);
  return <Provider store={store}>{children}</Provider>;
};

export default StoreProvider;
