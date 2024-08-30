import React, { FC } from 'react';
import { ProfileActions } from '../types';
import userProfileHook from './userProfileHook';

export const UserProfileContext = React.createContext<ProfileActions | null>(
  null
);

interface Props {
  children: React.ReactNode;
}

export const UserProfileProvider: FC<Props> = ({ children }) => {
  const actions = userProfileHook();
  return (
    <UserProfileContext.Provider value={actions}>
      {children}
    </UserProfileContext.Provider>
  );
};
