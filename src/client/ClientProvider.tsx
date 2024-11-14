import React, { FC } from 'react';
import { useClient } from './hooks';
import { Client, ClientProps } from './types';

export interface ClientContextProps {
  readonly client: Client;
}

export const ClientContext = React.createContext<ClientContextProps | null>(
  null
);

export const ClientProvider: FC<Partial<ClientProps>> = ({ children }) => {
  const client = useClient();
  return (
    <ClientContext.Provider
      value={{
        client,
      }}>
      {children}
    </ClientContext.Provider>
  );
};
