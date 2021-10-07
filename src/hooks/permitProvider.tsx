import React, { FC } from 'react';
import { PermitActions } from '../types';
import usePermitState from './permitHook';

export const PermitStateContext = React.createContext<PermitActions | null>(
  null
);

export const PermitProvider: FC<unknown> = ({ children }) => {
  const actions = usePermitState();
  return (
    <PermitStateContext.Provider value={actions}>
      {children}
    </PermitStateContext.Provider>
  );
};
