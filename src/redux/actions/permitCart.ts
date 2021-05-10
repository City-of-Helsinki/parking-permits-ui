import actionCreatorFactory from 'typescript-fsa';
import { Dispatch } from 'redux';

const actionCreator = actionCreatorFactory('permitCart');

// Set current stepper
export const setCurrentStepperAction = actionCreator<number>(
  'set-current-stepper'
);
export const setCurrentStepper = (id: number) => (dispatch: Dispatch): void => {
  dispatch(setCurrentStepperAction(id));
};
