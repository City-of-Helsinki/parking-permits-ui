import { keyBy } from 'lodash';
import { loader } from 'graphql.macro';
import { AnyAction, Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import actionCreatorFactory from 'typescript-fsa';
import {
  CreatePermitQueryResult,
  DeletePermitQueryResult,
  Permit,
  PermitQueryResult,
  UpdatePermitQueryResult,
  UserAddress,
  UserProfile,
} from '../types';
import PermitGqlClient from '../permitGqlClient';

const actionCreator = actionCreatorFactory('permitCart');

// // Set current stepper
export const setCurrentStepperAction = actionCreator<number>(
  'set-current-stepper'
);

export const setSelectedAddressAction = actionCreator<UserAddress>(
  'set-selected-address'
);

export const addRegistrationAction = actionCreator<string>(
  'add-registration-action'
);

export const updateRegistrationAction = actionCreator<{
  registration: string;
  index: number;
}>('update-registration-action');

export const updatePermitAction = actionCreator.async<
  Record<string, unknown>,
  { [reg: string]: Permit },
  Error
>('update-permit');

export const createPermitAction = actionCreator.async<
  Record<string, unknown>,
  { [reg: string]: Permit },
  Error
>('create-permit');

export const deletePermitAction = actionCreator.async<
  Record<string, unknown>,
  Error
>('delete-permit');

export const fetchPermitAction = actionCreator.async<
  Record<string, unknown>,
  { [reg: string]: Permit },
  Error
>('fetch-permits');

export const setCurrentStepper =
  (id: number) =>
  (dispatch: Dispatch): void => {
    dispatch(setCurrentStepperAction(id));
  };

export const setSelectedAddress =
  (address: UserAddress) =>
  (dispatch: Dispatch): void => {
    dispatch(setSelectedAddressAction(address));
  };

export const addRegistration =
  (registrationNumber: string) =>
  (dispatch: Dispatch): void => {
    dispatch(addRegistrationAction(registrationNumber));
  };

export const updateRegistration =
  (registrationNumber: string, index: number) =>
  (dispatch: Dispatch): void => {
    dispatch(
      updateRegistrationAction({
        registration: registrationNumber,
        index,
      })
    );
  };

export const fetchUserPermits =
  (user: UserProfile) =>
  async (
    dispatch: ThunkDispatch<
      Record<string, unknown>,
      Record<string, unknown>,
      AnyAction
    >
  ): Promise<void> => {
    dispatch(fetchPermitAction.started({}));
    const variables = { customerId: user.id };
    const client = new PermitGqlClient(loader('../../graphql/permits.graphql'));

    const { getPermits } = await client.mutate<PermitQueryResult>(variables);

    const { permits, success, errors } = getPermits;
    if (success) {
      const result = keyBy(permits, 'vehicle.registrationNumber');
      dispatch(fetchPermitAction.done({ params: {}, result }));
    } else {
      const error = new Error(errors.join('\n'));
      dispatch(fetchPermitAction.failed({ error, params: {} }));
    }
  };

export const updatePermit =
  (
    user: UserProfile,
    registration: string,
    permitId: string,
    permitPayload: Partial<Permit>
  ) =>
  async (
    dispatch: ThunkDispatch<
      Record<string, unknown>,
      Record<string, unknown>,
      AnyAction
    >
  ): Promise<void> => {
    dispatch(updatePermitAction.started({}));

    const variables = { permitId, input: permitPayload };
    const client = new PermitGqlClient(
      loader('../../graphql/updatePermit.graphql')
    );

    const { updateParkingPermit } =
      await client.mutate<UpdatePermitQueryResult>(variables);

    const { permit, success, errors } = updateParkingPermit;
    if (success) {
      const result = { [registration]: permit };
      dispatch(updatePermitAction.done({ params: {}, result }));
      if ('primaryVehicle' in permitPayload) {
        await dispatch(fetchUserPermits(user));
      }
    } else {
      const error = new Error(errors.join('\n'));
      dispatch(updatePermitAction.failed({ error, params: {} }));
    }
  };

export const createPermit =
  (customerId: string, zoneId: string, registration: string) =>
  async (
    dispatch: ThunkDispatch<
      Record<string, unknown>,
      Record<string, unknown>,
      AnyAction
    >
  ): Promise<void> => {
    dispatch(createPermitAction.started({}));

    const variables = { customerId, zoneId, registration };
    const client = new PermitGqlClient(
      loader('../../graphql/createPermit.graphql')
    );

    const { createParkingPermit } =
      await client.mutate<CreatePermitQueryResult>(variables);

    const { permit, success, errors } = createParkingPermit;
    if (success) {
      const result = { [registration]: permit };
      dispatch(createPermitAction.done({ params: {}, result }));
    } else {
      const error = new Error(errors.join('\n'));
      dispatch(createPermitAction.failed({ error, params: {} }));
    }
  };

export const deletePermit =
  (user: UserProfile, permitId: string) =>
  async (
    dispatch: ThunkDispatch<
      Record<string, unknown>,
      Record<string, unknown>,
      AnyAction
    >
  ): Promise<void> => {
    dispatch(deletePermitAction.started({}));

    const variables = { permitId };
    const client = new PermitGqlClient(
      loader('../../graphql/deletePermit.graphql')
    );

    const { deleteParkingPermit } =
      await client.mutate<DeletePermitQueryResult>(variables);

    const { success, errors } = deleteParkingPermit;
    if (success) {
      await dispatch(fetchUserPermits(user));
    } else {
      const error = new Error(errors.join('\n'));
      dispatch(deletePermitAction.failed({ error, params: {} }));
    }
  };
