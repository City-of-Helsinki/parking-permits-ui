import React, { FC } from 'react';
import { ProfileActions } from '../types';
import userProfileHook from './userProfileHook';

export const UserProfileContext = React.createContext<ProfileActions | null>(
  null
);

export const UserProfileProvider: FC<unknown> = ({ children }) => {
  const actions = userProfileHook();
  return (
    <UserProfileContext.Provider value={actions}>
      {children}
    </UserProfileContext.Provider>
  );
};
