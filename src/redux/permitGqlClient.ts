import { OperationVariables } from '@apollo/client/core/types';
import { DocumentNode } from 'graphql';
import { GraphQLClient } from '../graphql/graphqlClient';
import { getProfileGqlClient } from './utils';

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
