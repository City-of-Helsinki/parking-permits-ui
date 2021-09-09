import { reducerWithInitialState } from 'typescript-fsa-reducers';
import {
  addRegistrationAction,
  deleteRegistrationAction,
  fetchPermitAction,
  setCurrentStepperAction,
  setParkingDurationPeriodAction,
  setParkingDurationTypeAction,
  setParkingStartDateAction,
  setParkingStartTypeAction,
  setPrimaryVehicleAction,
  setSelectedAddressAction,
  updateRegistrationAction,
} from '../actions/permitCart';
import { PermitCartState, ProcessingStatus } from '../types';

const initialState: PermitCartState = {
  currentStep: 1,
};

const cartReducer = reducerWithInitialState<PermitCartState>(initialState)
  .case(setCurrentStepperAction, (state, action) => ({
    ...state,
    currentStep: action,
  }))
  .case(setSelectedAddressAction, (state, action) => ({
    ...state,
    selectedAddress: action,
  }))
  .case(setParkingStartTypeAction, (state, action) => {
    const { permits } = state;
    if (permits) {
      permits[action.registration] = {
        ...permits[action.registration],
        startType: action.type,
      };
    }
    return { ...state, permits };
  })
  .case(setParkingDurationTypeAction, (state, action) => {
    const { permits } = state;
    if (permits) {
      const { contract } = permits[action.registration];
      permits[action.registration] = {
        ...permits[action.registration],
        contract: {
          ...contract,
          contractType: action.type,
        },
      };
    }
    return { ...state, permits };
  })
  .case(setParkingDurationPeriodAction, (state, action) => {
    const { permits } = state;
    if (permits) {
      permits[action.registration].contract.monthCount = action.duration;
    }
    return { ...state, permits };
  })
  .case(setParkingStartDateAction, (state, action) => {
    const { permits } = state;
    if (permits) {
      permits[action.registration].startTime = action.date;
    }
    return { ...state, permits };
  })
  .case(addRegistrationAction, (state, action) => ({
    ...state,
    registrationNumbers: [...(state?.registrationNumbers || []), action],
  }))
  .case(updateRegistrationAction, (state, action) => {
    const registrations = state.registrationNumbers;
    if (registrations) {
      registrations[action.index] = action.registration;
    }
    return { ...state, registrationNumbers: registrations };
  })
  .case(deleteRegistrationAction, (state, action) => ({
    ...state,
    registrationNumbers: (state?.registrationNumbers || []).filter(
      reg => reg !== action
    ),
  }))
  .case(setPrimaryVehicleAction, (state, action) => {
    const { permits } = state;
    if (permits) {
      permits[action.registration].primaryVehicle = action.primary;
      Object.keys(permits).forEach(reg => {
        if (reg !== action.registration) {
          permits[reg].primaryVehicle = false;
        }
      });
    }
    return { ...state, permits };
  })
  .case(fetchPermitAction.started, state => ({
    ...state,
    fetchingStatus: ProcessingStatus.PROCESSING,
  }))
  .case(fetchPermitAction.done, (state, action) => ({
    ...state,
    fetchingStatus: ProcessingStatus.SUCCESS,
    permits: { ...state.permits, ...action.result },
  }))
  .case(fetchPermitAction.failed, (state, action) => ({
    ...state,
    error: action.error,
    fetchingStatus: ProcessingStatus.FAILURE,
  }));

export default cartReducer;
