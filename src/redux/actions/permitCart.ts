import { ThunkDispatch } from 'redux-thunk';
import { AnyAction, Dispatch } from 'redux';
import actionCreatorFactory from 'typescript-fsa';

import {
  ParkingDurationType,
  ParkingStartType,
  Permit,
  STEPPER,
  UserAddress,
  ValidityPeriod,
} from '../types';
import { getPermit } from './testHTTPResponse';

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

export const setValidityPeriodAction = actionCreator<{
  registration: string;
  period: ValidityPeriod;
}>('validity-period');

export const setPrimaryVehicleAction = actionCreator<{
  registration: string;
  primary: boolean;
}>('set-primary-vehicle');

export const fetchVehicleAndPermitPricesAction = actionCreator.async<
  Record<string, unknown>,
  { [reg: string]: Permit },
  Error
>('fetch');

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

export const setValidityPeriod =
  (registration: string, period: ValidityPeriod) =>
  (dispatch: Dispatch): void => {
    dispatch(setValidityPeriodAction({ registration, period }));
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

export const fetchVehicleAndPrices =
  (registrationNumbers: string[]) =>
  async (
    dispatch: ThunkDispatch<
      Record<string, unknown>,
      Record<string, unknown>,
      AnyAction
    >
  ): Promise<void> => {
    dispatch(fetchVehicleAndPermitPricesAction.started({}));
    // eslint-disable-next-line no-magic-numbers
    await new Promise(res => setTimeout(res, 500));
    const result: { [reg: string]: Permit } = {};
    registrationNumbers.forEach((reg, i) => {
      result[reg] = getPermit(reg, i === 0);
    });

    dispatch(
      fetchVehicleAndPermitPricesAction.done({
        params: {},
        result,
      })
    );
    dispatch(setCurrentStepper(STEPPER.PERMIT_PRICES));
  };
