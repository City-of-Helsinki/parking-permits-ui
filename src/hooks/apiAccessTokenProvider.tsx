import React, { FC } from 'react';
import { useApiAccessTokens } from '../client/hooks';
import { ApiAccessTokenActions } from '../client/types';

export const ApiAccessTokenContext =
  React.createContext<ApiAccessTokenActions | null>(null);

interface Props {
  children: React.ReactNode;
}

export const ApiAccessTokenProvider: FC<Props> = ({ children }) => {
  const actions = useApiAccessTokens();
  return (
    <ApiAccessTokenContext.Provider value={actions}>
      {children}
    </ApiAccessTokenContext.Provider>
  );
};
