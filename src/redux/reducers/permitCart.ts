import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { PermitCartState, ProcessingStatus } from '../types';
import {
  addRegistrationAction,
  updateRegistrationAction,
  setPrimaryVehicleAction,
  setCurrentStepperAction,
  setValidityPeriodAction,
  setSelectedAddressAction,
  setParkingStartTypeAction,
  setParkingStartDateAction,
  setParkingDurationTypeAction,
  setParkingDurationPeriodAction,
  fetchVehicleAndPermitPricesAction,
  deleteRegistrationAction,
} from '../actions/permitCart';

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
      permits[action.registration].startType = action.type;
    }
    return { ...state, permits };
  })
  .case(setParkingDurationTypeAction, (state, action) => {
    const { permits } = state;
    if (permits) {
      permits[action.registration].durationType = action.type;
    }
    return { ...state, permits };
  })
  .case(setParkingDurationPeriodAction, (state, action) => {
    const { permits } = state;
    if (permits) {
      permits[action.registration].duration = action.duration;
    }
    return { ...state, permits };
  })
  .case(setParkingStartDateAction, (state, action) => {
    const { permits } = state;
    if (permits) {
      permits[action.registration].startDate = action.date;
    }
    return { ...state, permits };
  })
  .case(setValidityPeriodAction, (state, action) => {
    const { permits } = state;
    if (permits) {
      permits[action.registration].validityPeriod = action.period;
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
      reg => reg === action
    ),
  }))
  .case(setPrimaryVehicleAction, (state, action) => {
    const { permits } = state;
    if (permits) {
      permits[action.registration].vehicle.primary = action.primary;
      Object.keys(permits).forEach(reg => {
        if (reg !== action.registration) {
          permits[reg].vehicle.primary = false;
        }
      });
    }
    return { ...state, permits };
  })
  .case(fetchVehicleAndPermitPricesAction.started, state => ({
    ...state,
    fetchingStatus: ProcessingStatus.PROCESSING,
  }))
  .case(fetchVehicleAndPermitPricesAction.done, (state, action) => ({
    ...state,
    fetchingStatus: ProcessingStatus.SUCCESS,
    permits: { ...state.permits, ...action.result },
  }))
  .case(fetchVehicleAndPermitPricesAction.failed, (state, action) => ({
    ...state,
    error: action.error,
    fetchingStatus: ProcessingStatus.FAILURE,
  }));

export default cartReducer;
