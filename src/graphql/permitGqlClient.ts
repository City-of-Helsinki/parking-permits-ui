import { OperationVariables } from '@apollo/client/core/types';
import { DocumentNode } from 'graphql';
import { getGqlClient } from '../hooks/graphqlClientModule';
import {
  AddTemporaryVehicleResult,
  ChangeAddressResult,
  CreateOrderQueryResult,
  CreatePermitQueryResult,
  DeletePermitQueryResult,
  ExtendPermitQueryResult,
  ExtendPermitResult,
  ExtendedPriceListItem,
  ExtendedPriceListQueryResult,
  EndPermitQueryResult,
  GetUpdateAddressPriceChangesResult,
  GetVehicleInformationQueryResult,
  Permit,
  PermitQueryResult,
  RemoveTemporaryVehicleResult,
  UpdatePermitQueryResult,
  UpdatePermitVehicleQueryResult,
  UserAddress,
} from '../types';
import { getEnv } from '../utils';
import addTemporaryVehicleDocument from './addTemporaryVehicle';
import changeAddressDocument from './changeAddress';
import createOrderDocument from './createOrder';
import createPermitDocument from './createPermit';
import deletePermitDocument from './deletePermit';
import endPermitDocument from './endPermit';
import extendPermitDocument from './extendPermit';
import getExtendedPriceListDocument from './getExtendedPriceList';
import getUpdateAddressPriceChangesDocument from './getUpdateAddressPriceChanges';
import getVehicleInformationDocument from './getVehicleInformation';
import { GraphQLClient } from './graphqlClient';
import permitsDocument from './permits';
import removeTemporaryVehicleDocument from './removeTemporaryVehicle';
import updatePermitDocument from './updatePermit';
import updatePermitVehicleDocument from './updatePermitVehicle';

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
): Promise<ExtendPermitResult> => {
  const client = new PermitGqlClient(extendPermitDocument);
  const variables = { permitId, monthCount };
  return client
    .mutate<ExtendPermitQueryResult>(variables)
    .then(res => res.extendParkingPermit);
};

export const getExtendedPriceList = (
  permitId: string,
  monthCount: number
): Promise<Array<ExtendedPriceListItem>> => {
  const client = new PermitGqlClient(getExtendedPriceListDocument);
  const variables = { permitId, monthCount };
  return client
    .query<ExtendedPriceListQueryResult>(variables)
    .then(res => res.getExtendedPriceList);
};

export const getAllPermits = (): Promise<PermitQueryResult['getPermits']> => {
  const client = new PermitGqlClient(permitsDocument);
  return client.query<PermitQueryResult>({}).then(res => res.getPermits);
};

export const createDraftPermit = (
  address: UserAddress,
  registration: string
): Promise<CreatePermitQueryResult['createParkingPermit']> => {
  const variables = { addressId: address?.id, registration };
  const client = new PermitGqlClient(createPermitDocument);
  return client
    .mutate<CreatePermitQueryResult>(variables)
    .then(res => res.createParkingPermit);
};

export const updateDraftPermit = (
  payload: Partial<Permit>,
  permitId: string | undefined
): Promise<UpdatePermitQueryResult['updateParkingPermit']> => {
  const variables = { permitId, input: payload };
  const client = new PermitGqlClient(updatePermitDocument);
  return client
    .mutate<UpdatePermitQueryResult>(variables)
    .then(res => res.updateParkingPermit);
};

export const deleteDraftPermit = (
  permitId: string
): Promise<DeletePermitQueryResult['deleteParkingPermit']> => {
  const variables = { permitId };
  const client = new PermitGqlClient(deletePermitDocument);
  return client
    .mutate<DeletePermitQueryResult>(variables)
    .then(res => res.deleteParkingPermit);
};

export const endPermits = (
  permitIds: string[],
  endType: string,
  iban: string
): Promise<EndPermitQueryResult['endParkingPermit']> => {
  const variables = { permitIds, endType, iban };
  const client = new PermitGqlClient(endPermitDocument);
  return client
    .mutate<EndPermitQueryResult>(variables)
    .then(res => res.endParkingPermit);
};

export const createOrder = (): Promise<
  CreateOrderQueryResult['createOrder']
> => {
  const client = new PermitGqlClient(createOrderDocument);
  return client.mutate<CreateOrderQueryResult>({}).then(res => res.createOrder);
};

export const getChangeAddressPriceChanges = (
  addressId: string
): Promise<
  GetUpdateAddressPriceChangesResult['getUpdateAddressPriceChanges']
> => {
  const client = new PermitGqlClient(getUpdateAddressPriceChangesDocument);
  const variables = { addressId };
  return client
    .query<GetUpdateAddressPriceChangesResult>(variables)
    .then(res => res.getUpdateAddressPriceChanges);
};

export const changeAddress = (
  addressId: string,
  iban?: string
): Promise<ChangeAddressResult['changeAddress']> => {
  const client = new PermitGqlClient(changeAddressDocument);
  const variables = { addressId, iban };
  return client
    .mutate<ChangeAddressResult>(variables)
    .then(res => res.changeAddress);
};

export const getVehicleInformation = (
  registration: string
): Promise<GetVehicleInformationQueryResult['getVehicleInformation']> => {
  const variables = { registration };
  const client = new PermitGqlClient(getVehicleInformationDocument);
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
  const client = new PermitGqlClient(updatePermitVehicleDocument);
  return client
    .mutate<UpdatePermitVehicleQueryResult>(variables)
    .then(res => res.updatePermitVehicle);
};

export const addTemporaryVehicleToPermit = (
  permitId: string,
  registration: string,
  startTime: string,
  endTime: string
): Promise<AddTemporaryVehicleResult['addTemporaryVehicle']> => {
  const variables = { permitId, registration, startTime, endTime };
  const client = new PermitGqlClient(addTemporaryVehicleDocument);
  return client
    .mutate<AddTemporaryVehicleResult>(variables)
    .then(res => res.addTemporaryVehicle);
};

export const removeTemporaryVehicleFromPermit = (
  permitId: string
): Promise<RemoveTemporaryVehicleResult['removeTemporaryVehicle']> => {
  const variables = { permitId };
  const client = new PermitGqlClient(removeTemporaryVehicleDocument);
  return client
    .mutate<RemoveTemporaryVehicleResult>(variables)
    .then(res => res.removeTemporaryVehicle);
};
