import { OperationVariables } from '@apollo/client/core/types';
import { DocumentNode } from 'graphql';
import { loader } from 'graphql.macro';
import { getGqlClient } from '../hooks/utils';
import {
  ChangeAddressResult,
  createOrderQueryResult,
  CreatePermitQueryResult,
  DeletePermitQueryResult,
  endPermitQueryResult,
  GetUpdateAddressPriceChangesResult,
  Permit,
  PermitQueryResult,
  UpdatePermitQueryResult,
  UpdateVehicleQueryResult,
  UserAddress,
} from '../types';
import { getEnv } from '../utils';
import { GraphQLClient } from './graphqlClient';

class PermitGqlClient {
  uri = getEnv('REACT_APP_PARKING_PERMITS_BACKEND_URL');

  client: GraphQLClient;

  constructor(public documentNode: DocumentNode) {
    this.client = getGqlClient() as GraphQLClient;
  }

  async query<T>(variables: OperationVariables): Promise<T> {
    const result = await this.client.query({
      query: this.documentNode,
      variables,
    });
    if (result.data) {
      return result.data;
    }
    return Promise.reject(result.errors);
  }

  async mutate<T>(variables: OperationVariables): Promise<T> {
    const result = await this.client.mutate({
      mutation: this.documentNode,
      variables,
    });
    if (result.data) {
      return result.data;
    }
    return Promise.reject(result.errors);
  }
}

export const updateVehicleRegistration = (
  permit: Permit,
  registration: string
): Promise<UpdateVehicleQueryResult['updateVehicle']> => {
  const variables = { vehicleId: permit?.vehicle.id, registration };
  const client = new PermitGqlClient(
    loader('../graphql/updateVehicle.graphql')
  );
  return client
    .mutate<UpdateVehicleQueryResult>(variables)
    .then(res => res.updateVehicle);
};

export const getAllPermits = (): Promise<PermitQueryResult['getPermits']> => {
  const LOADER = loader('../graphql/permits.graphql');
  const client = new PermitGqlClient(LOADER);
  return client.query<PermitQueryResult>({}).then(res => res.getPermits);
};

export const createDraftPermit = (
  address: UserAddress
): Promise<CreatePermitQueryResult['createParkingPermit']> => {
  const variables = { zoneId: address?.zone?.id };
  const client = new PermitGqlClient(loader('../graphql/createPermit.graphql'));
  return client
    .mutate<CreatePermitQueryResult>(variables)
    .then(res => res.createParkingPermit);
};

export const updateDraftPermit = (
  payload: Partial<Permit>,
  permitId: string | undefined
): Promise<UpdatePermitQueryResult['updateParkingPermit']> => {
  const variables = { permitId, input: payload };
  const client = new PermitGqlClient(loader('../graphql/updatePermit.graphql'));
  return client
    .mutate<UpdatePermitQueryResult>(variables)
    .then(res => res.updateParkingPermit);
};

export const deleteDraftPermit = (
  permitId: string
): Promise<DeletePermitQueryResult['deleteParkingPermit']> => {
  const variables = { permitId };
  const client = new PermitGqlClient(loader('../graphql/deletePermit.graphql'));
  return client
    .mutate<DeletePermitQueryResult>(variables)
    .then(res => res.deleteParkingPermit);
};

export const endPermits = (
  permitIds: string,
  endType: string,
  iban: string
): Promise<endPermitQueryResult['endParkingPermit']> => {
  const variables = { permitIds, endType, iban };
  const client = new PermitGqlClient(loader('../graphql/endPermit.graphql'));
  return client
    .mutate<endPermitQueryResult>(variables)
    .then(res => res.endParkingPermit);
};

export const createOrder = (): Promise<
  createOrderQueryResult['createOrder']
> => {
  const client = new PermitGqlClient(loader('../graphql/createOrder.graphql'));
  return client.mutate<createOrderQueryResult>({}).then(res => res.createOrder);
};

export const getChangeAddressPriceChanges = (
  addressId: string
): Promise<
  GetUpdateAddressPriceChangesResult['getUpdateAddressPriceChanges']
> => {
  const client = new PermitGqlClient(
    loader('../graphql/getUpdateAddressPriceChanges.graphql')
  );
  const variables = { addressId };
  return client
    .query<GetUpdateAddressPriceChangesResult>(variables)
    .then(res => res.getUpdateAddressPriceChanges);
};

export const changeAddress = (
  addressId: string,
  iban?: string
): Promise<ChangeAddressResult['changeAddress']> => {
  const client = new PermitGqlClient(
    loader('../graphql/changeAddress.graphql')
  );
  const variables = { addressId, iban };
  return client
    .mutate<ChangeAddressResult>(variables)
    .then(res => res.changeAddress);
};
