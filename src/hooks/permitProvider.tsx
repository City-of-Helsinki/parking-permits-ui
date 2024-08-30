import React, { FC } from 'react';
import { PermitActions } from '../types';
import usePermitState from './permitHook';

export const PermitStateContext = React.createContext<PermitActions | null>(
  null
);

interface Props {
  children: React.ReactNode;
}

export const PermitProvider: FC<Props> = ({ children }) => {
  const actions = usePermitState();
  return (
    <PermitStateContext.Provider value={actions}>
      {children}
    </PermitStateContext.Provider>
  );
};
