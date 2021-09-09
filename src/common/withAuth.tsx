import React from 'react';
import { useClient } from '../client/hooks';
import { Client } from '../client/types';

export type WithAuthChildProps = { client: Client };

const WithAuth = (
  AuthorizedContent: React.ComponentType<WithAuthChildProps>,
  UnAuthorizedContent: React.ComponentType<WithAuthChildProps>,
  InitializingContent?: React.ComponentType<unknown>
): React.ReactElement => {
  const client = useClient();
  if (InitializingContent && !client.isInitialized()) {
    return <InitializingContent />;
  }
  return client.isAuthenticated() ? (
    <AuthorizedContent client={client} />
  ) : (
    <UnAuthorizedContent client={client} />
  );
};

export default WithAuth;
