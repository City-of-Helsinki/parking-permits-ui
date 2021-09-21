import { OperationVariables } from '@apollo/client/core/types';
import { DocumentNode } from 'graphql';
import { createGraphQLClient, GraphQLClient } from '../graphql/graphqlClient';
import { PARKING_PERMIT_TOKEN } from './types';

class PermitGqlClient {
  uri = process.env.REACT_APP_PROFILE_BACKEND_URL;

  client: GraphQLClient;

  constructor(public documentNode: DocumentNode) {
    const token = sessionStorage.getItem(PARKING_PERMIT_TOKEN);
    this.client = createGraphQLClient(this.uri as string, token as string);
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
