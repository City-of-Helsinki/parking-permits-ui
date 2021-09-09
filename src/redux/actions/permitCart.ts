import { ApolloQueryResult } from '@apollo/client/core/types';
import { loader } from 'graphql.macro';
import { keyBy } from 'lodash';
import { AnyAction, Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import actionCreatorFactory from 'typescript-fsa';
import {
  ParkingDurationType,
  ParkingStartType,
  Permit,
  PermitQueryResult,
  UserAddress,
  UserProfile,
} from '../types';
import { getProfileGqlClient } from '../utils';

const actionCreator = actionCreatorFactory('permitCart');

// Set current stepper
export const setCurrentStepperAction = actionCreator<number>(
  'set-current-stepper'
);

export const setSelectedAddressAction = actionCreator<UserAddress>(
  'set-selected-address'
);
export const setParkingStartTypeAction = actionCreator<{
  registration: string;
  type: ParkingStartType;
}>('parking-start-type');

export const setParkingStartDateAction = actionCreator<{
  registration: string;
  date: Date;
}>('parking-start-date');

export const setParkingDurationTypeAction = actionCreator<{
  registration: string;
  type: ParkingDurationType;
}>('parking-duration-type');

export const setParkingDurationPeriodAction = actionCreator<{
  registration: string;
  duration: number;
}>('parking-duration-period');

export const addRegistrationAction = actionCreator<string>(
  'add-registration-action'
);

export const deleteRegistrationAction = actionCreator<string>(
  'delete-registration-action'
);

export const updateRegistrationAction = actionCreator<{
  registration: string;
  index: number;
}>('set-registration-action');

export const setPrimaryVehicleAction = actionCreator<{
  registration: string;
  primary: boolean;
}>('set-primary-vehicle');

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

export const setParkingStartType =
  (registration: string, type: ParkingStartType) =>
  (dispatch: Dispatch): void => {
    dispatch(setParkingStartTypeAction({ registration, type }));
  };

export const setParkingStartDate =
  (registration: string, date: Date) =>
  (dispatch: Dispatch): void => {
    dispatch(setParkingStartDateAction({ registration, date }));
  };

export const setParkingDurationType =
  (registration: string, type: ParkingDurationType) =>
  (dispatch: Dispatch): void => {
    dispatch(setParkingDurationTypeAction({ registration, type }));
  };

export const setParkingDurationPeriod =
  (registration: string, duration: number) =>
  (dispatch: Dispatch): void => {
    dispatch(setParkingDurationPeriodAction({ registration, duration }));
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

export const setRegistration =
  (registrationNumber: string, index: number) =>
  (dispatch: Dispatch): void => {
    dispatch(
      updateRegistrationAction({
        registration: registrationNumber,
        index,
      })
    );
  };

export const deleteRegistration =
  (registration: string) =>
  (dispatch: Dispatch): void => {
    dispatch(deleteRegistrationAction(registration));
  };

export const setPrimaryVehicle =
  (registration: string, primary: boolean) =>
  (dispatch: Dispatch): void => {
    dispatch(setPrimaryVehicleAction({ registration, primary }));
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
    const client = getProfileGqlClient();
    if (!client) {
      dispatch(
        fetchPermitAction.failed({
          error: new Error('getProfileGqlClient returned undefined.'),
          params: {},
        })
      );
      return;
    }
    const PERMITS_QUERY = loader('../../graphql/permits.graphql');
    const result: ApolloQueryResult<PermitQueryResult> = await client.query({
      errorPolicy: 'all',
      query: PERMITS_QUERY,
      variables: { customerId: user.id },
    });
    const { permits } = result.data.getPermits;
    if (permits) {
      const permitsObject = keyBy(permits, 'vehicle.registrationNumber');
      Object.keys(permitsObject).map(reg => dispatch(addRegistration(reg)));
      dispatch(
        fetchPermitAction.done({
          params: {},
          result: permitsObject,
        })
      );
    } else {
      dispatch(
        fetchPermitAction.failed({
          error: new Error('Query result is missing data.profile'),
          params: {},
        })
      );
    }
  };
