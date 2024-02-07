import { OperationVariables } from '@apollo/client/core/types';
import { DocumentNode } from 'graphql';
import { loader } from 'graphql.macro';
import { getGqlClient } from '../hooks/utils';
import {
  addTemporaryVehicle,
  ChangeAddressResult,
  createOrderQueryResult,
  CreatePermitQueryResult,
  DeletePermitQueryResult,
  ExtendPermitResult,
  endPermitQueryResult,
  GetUpdateAddressPriceChangesResult,
  GetVehicleInformationQueryResult,
  Permit,
  PermitQueryResult,
  removeTemporaryVehicle,
  UpdatePermitQueryResult,
  UpdatePermitVehicleQueryResult,
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
export const extendPermit = (
  permitId: string,
  monthCount: number
): Promise<string> => {
  const client = new PermitGqlClient(loader('../graphql/extendPermit.graphql'));
  const variables = { permitId, monthCount };
  return client
    .mutate<ExtendPermitResult>(variables)
    .then(res => res.checkoutUrl);
};

export const getExtendedPriceList = (
  permitId: string,
  monthCount: number
): Promise<ExtendedPriceList> => {
  const client = new PermitGqlClient(
    loader('../graphql/getExtendedPriceList.graphql')
  );
  const variables = { permitId, monthCount };
  return client.query<PermitExtendedQueryResult>(variables);
};

export const getAllPermits = (): Promise<PermitQueryResult['getPermits']> => {
  const LOADER = loader('../graphql/permits.graphql');
  const client = new PermitGqlClient(LOADER);
  return client.query<PermitQueryResult>({}).then(res => res.getPermits);
};

export const createDraftPermit = (
  address: UserAddress,
  registration: string
): Promise<CreatePermitQueryResult['createParkingPermit']> => {
  const variables = { addressId: address?.id, registration };
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

export const getVehicleInformation = (
  registration: string
): Promise<GetVehicleInformationQueryResult['getVehicleInformation']> => {
  const variables = { registration };
  const client = new PermitGqlClient(
    loader('../graphql/getVehicleInformation.graphql')
  );
  return client
    .mutate<GetVehicleInformationQueryResult>(variables)
    .then(res => res.getVehicleInformation);
};

export const updatePermitVehicle = (
  permitId: string | undefined,
  vehicleId: string | undefined,
  consentLowEmissionAccepted: boolean,
  iban?: string
): Promise<UpdatePermitVehicleQueryResult['updatePermitVehicle']> => {
  const variables = { permitId, vehicleId, iban, consentLowEmissionAccepted };
  const client = new PermitGqlClient(
    loader('../graphql/updatePermitVehicle.graphql')
  );
  return client
    .mutate<UpdatePermitVehicleQueryResult>(variables)
    .then(res => res.updatePermitVehicle);
};

export const addTemporaryVehicleToPermit = (
  permitId: string,
  registration: string,
  startTime: string,
  endTime: string
): Promise<addTemporaryVehicle['addTemporaryVehicle']> => {
  const variables = { permitId, registration, startTime, endTime };
  const client = new PermitGqlClient(
    loader('../graphql/addTemporaryVehicle.graphql')
  );
  return client
    .mutate<addTemporaryVehicle>(variables)
    .then(res => res.addTemporaryVehicle);
};

export const removeTemporaryVehicleFromPermit = (
  permitId: string
): Promise<removeTemporaryVehicle['removeTemporaryVehicle']> => {
  const variables = { permitId };
  const client = new PermitGqlClient(
    loader('../graphql/removeTemporaryVehicle.graphql')
  );
  return client
    .mutate<removeTemporaryVehicle>(variables)
    .then(res => res.removeTemporaryVehicle);
};
