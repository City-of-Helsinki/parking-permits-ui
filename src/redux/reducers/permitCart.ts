import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { PermitCartState } from '../types';
import { setCurrentStepperAction } from '../actions/permitCart';

const initialState: PermitCartState = {
  currentStep: 1,
};

const cartReducer = reducerWithInitialState<PermitCartState>(initialState).case(
  setCurrentStepperAction,
  (state, action) => ({
    ...state,
    currentStep: action,
  })
);

export default cartReducer;
