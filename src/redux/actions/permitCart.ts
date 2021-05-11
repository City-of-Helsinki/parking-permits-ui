import actionCreatorFactory from 'typescript-fsa';
import { Dispatch } from 'redux';

const actionCreator = actionCreatorFactory('permitCart');

// Set current stepper
export const setCurrentStepperAction = actionCreator<number>(
  'set-current-stepper'
);
export const setSelectedAddressIdAction = actionCreator<string>(
  'set-selected-address-id'
);
export const setRegistrationNumberAction = actionCreator<string>(
  'set-registration-number'
);
export const setCurrentStepper = (id: number) => (dispatch: Dispatch): void => {
  dispatch(setCurrentStepperAction(id));
};

export const setSelectedAddressId = (id: string) => (
  dispatch: Dispatch
): void => {
  dispatch(setSelectedAddressIdAction(id));
};

export const setRegistrationNumber = (reg: string) => (
  dispatch: Dispatch
): void => {
  dispatch(setRegistrationNumberAction(reg));
};
