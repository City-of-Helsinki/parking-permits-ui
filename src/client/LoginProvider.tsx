import { LoginProvider as HDSLoginProvider } from 'hds-react';
import React, { FC, useMemo } from 'react';

import { getHDSClientConfig } from '.';
import { createGraphQLClientModule } from '../hooks/graphqlClientModule';

interface LoginProviderProps {
  children: React.ReactNode;
}

const LoginProvider: FC<LoginProviderProps> = ({ children }) => {
  const loginProviderProps = getHDSClientConfig();
  const graphqlModule = useMemo(() => createGraphQLClientModule(), []);

  return (
    <HDSLoginProvider {...loginProviderProps} modules={[graphqlModule]}>
      {children}
    </HDSLoginProvider>
  );
};

export default LoginProvider;
