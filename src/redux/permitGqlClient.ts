import { DocumentNode } from 'graphql';
import { OperationVariables } from '@apollo/client/core/types';

import { getProfileGqlClient } from './utils';
import { GraphQLClient } from '../graphql/graphqlClient';

class PermitGqlClient {
  client: GraphQLClient;

  constructor(public documentNode: DocumentNode) {
    this.client = getProfileGqlClient() as GraphQLClient;
  }

  async query<T>(variables: OperationVariables): Promise<T> {
    const result = await this.client.query({
      query: this.documentNode,
      variables,
    });
    return result.data;
  }

  async mutate<T>(variables: OperationVariables): Promise<T> {
    const result = await this.client.mutate({
      mutation: this.documentNode,
      variables,
    });
    return result.data;
  }
}

export default PermitGqlClient;
