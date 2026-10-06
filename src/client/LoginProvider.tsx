import { LoginProvider } from 'hds-react';
import React, { FC, useMemo } from 'react';

import { getHDSClientConfig } from '.';
import { createGraphQLClientModule } from '../hooks/graphqlClientModule';

interface HDSLoginProviderProps {
  children: React.ReactNode;
}

const HDSLoginProvider: FC<HDSLoginProviderProps> = ({ children }) => {
  const loginProviderProps = getHDSClientConfig();
  const graphqlModule = useMemo(() => createGraphQLClientModule(), []);

  return (
    <LoginProvider {...loginProviderProps} modules={[graphqlModule]}>
      {children}
    </LoginProvider>
  );
};

export default HDSLoginProvider;
