import React, { FC, useEffect } from 'react';
import { Provider } from 'react-redux';
import { useClient } from '../client/hooks';
import { connected } from './actions/user';
import { connectClient, store } from './store';

const StoreProvider: FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const client = useClient();
  useEffect(() => {
    connectClient(client);
    store.dispatch(connected(client));
  }, [client]);
  return <Provider store={store}>{children}</Provider>;
};

export default StoreProvider;
