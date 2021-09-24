import { uniq } from 'lodash';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import {
  addRegistrationAction,
  createPermitAction,
  fetchPermitAction,
  setCurrentStepperAction,
  setSelectedAddressAction,
  updatePermitAction,
  updateRegistrationAction,
} from '../actions/permitCart';
import {
  Permit,
  PermitCartState,
  PermitStatus,
  ProcessingStatus,
  STEPPER,
} from '../types';

const initialState: PermitCartState = {
  currentStep: STEPPER.VALID_PERMITS,
};

const getRegForStatus = (
  payload: { [registrationNumber: string]: Permit },
  status: PermitStatus
) =>
  Object.values(payload)
    .filter(permit => permit.status === status)
    .map(permit => permit.vehicle.registrationNumber);

const cartReducer = reducerWithInitialState<PermitCartState>(initialState)
  .case(setCurrentStepperAction, (state, action) => ({
    ...state,
    currentStep: action,
  }))
  .case(setSelectedAddressAction, (state, action) => ({
    ...state,
    selectedAddress: action,
  }))
  .case(addRegistrationAction, (state, action) => ({
    ...state,
    registrationNumbers: uniq([...(state?.registrationNumbers || []), action]),
  }))
  .case(updateRegistrationAction, (state, action) => {
    const registrations = state.registrationNumbers;
    if (registrations) {
      registrations[action.index] = action.registration;
    }
    return { ...state, registrationNumbers: registrations };
  })
  .case(fetchPermitAction.started, state => ({
    ...state,
    fetchingStatus: ProcessingStatus.PROCESSING,
  }))
  .case(fetchPermitAction.done, (state, action) => ({
    ...state,
    fetchingStatus: ProcessingStatus.SUCCESS,
    registrationNumbers: getRegForStatus(action.result, PermitStatus.DRAFT),
    validRegistrationNumbers: getRegForStatus(
      action.result,
      PermitStatus.VALID
    ),
    permits: action.result,
  }))
  .case(updatePermitAction.started, state => ({
    ...state,
    fetchingStatus: ProcessingStatus.PROCESSING,
  }))
  .case(updatePermitAction.done, (state, action) => ({
    ...state,
    fetchingStatus: ProcessingStatus.SUCCESS,
    permits: { ...state.permits, ...action.result },
  }))
  .case(updatePermitAction.failed, (state, action) => ({
    ...state,
    error: action.error,
    fetchingStatus: ProcessingStatus.FAILURE,
  }))
  .case(createPermitAction.started, state => ({
    ...state,
    fetchingStatus: ProcessingStatus.PROCESSING,
  }))
  .case(createPermitAction.done, (state, action) => ({
    ...state,
    fetchingStatus: ProcessingStatus.SUCCESS,
    permits: { ...state.permits, ...action.result },
  }))
  .case(createPermitAction.failed, (state, action) => ({
    ...state,
    error: action.error,
    fetchingStatus: ProcessingStatus.FAILURE,
  }));

export default cartReducer;
