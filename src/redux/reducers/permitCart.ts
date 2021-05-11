import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { PermitCartState } from '../types';
import {
  setCurrentStepperAction,
  setSelectedAddressIdAction,
  setRegistrationNumberAction,
} from '../actions/permitCart';

const initialState: PermitCartState = {
  currentStep: 1,
};

const cartReducer = reducerWithInitialState<PermitCartState>(initialState)
  .case(setCurrentStepperAction, (state, action) => ({
    ...state,
    currentStep: action,
  }))
  .case(setSelectedAddressIdAction, (state, action) => ({
    ...state,
    selectedAddressId: action,
  }))
  .case(setRegistrationNumberAction, (state, action) => ({
    ...state,
    registrationNumber: action,
  }));

export default cartReducer;
