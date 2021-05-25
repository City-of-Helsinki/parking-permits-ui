import actionCreatorFactory from 'typescript-fsa';
import { Dispatch } from 'redux';
import { ParkingDurationType, ParkingStartType } from '../types';

const actionCreator = actionCreatorFactory('permitCart');

// Set current stepper
export const setCurrentStepperAction = actionCreator<number>(
  'set-current-stepper'
);
export const setSelectedAddressIdAction = actionCreator<string>(
  'set-selected-address-id'
);
export const setParkingStartTypeAction = actionCreator<ParkingStartType>(
  'parking-start-type'
);
export const setParkingStartDateAction = actionCreator<Date>(
  'parking-start-date'
);
export const setParkingDurationTypeAction = actionCreator<ParkingDurationType>(
  'parking-duration-type'
);
export const fetchVehicleDetailAction = actionCreator<string | undefined>(
  'fetch-vehicle-detail'
);
export const setParkingDurationPeriodAction = actionCreator<number>(
  'parking-duration-period'
);
export const setCurrentStepper = (id: number) => (dispatch: Dispatch): void => {
  dispatch(setCurrentStepperAction(id));
};

export const setParkingStartType = (type: ParkingStartType) => (
  dispatch: Dispatch
): void => {
  dispatch(setParkingStartTypeAction(type));
};

export const setParkingStartDate = (date: Date) => (
  dispatch: Dispatch
): void => {
  dispatch(setParkingStartDateAction(date));
};

export const setParkingDurationType = (type: ParkingDurationType) => (
  dispatch: Dispatch
): void => {
  dispatch(setParkingDurationTypeAction(type));
};

export const setParkingDurationPeriod = (duration: number) => (
  dispatch: Dispatch
): void => {
  dispatch(setParkingDurationPeriodAction(duration));
};

export const setSelectedAddressId = (id: string) => (
  dispatch: Dispatch
): void => {
  dispatch(setSelectedAddressIdAction(id));
};

export const fetchVehicleDetail = (reg: string | undefined) => (
  dispatch: Dispatch
): void => {
  dispatch(fetchVehicleDetailAction(reg));
};
