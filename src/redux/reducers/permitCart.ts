import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { PermitCartState } from '../types';
import {
  setCurrentStepperAction,
  setSelectedAddressIdAction,
  fetchVehicleDetailAction,
  setParkingStartTypeAction,
  setParkingDurationTypeAction,
  setParkingDurationPeriodAction,
  setParkingStartDateAction,
  setValidityPeriodAction,
  setPurchasedAction,
} from '../actions/permitCart';

const mockDataCarDetail = {
  id: '1232',
  type: 'sedan',
  manufacturer: 'Toyota',
  model: 'Yaris',
  productionYear: 2020,
  emission: 85,
  owner: '123-asd',
  holder: '123-asd',
  registrationNumber: '',
};

const initialState: PermitCartState = {
  currentStep: 1,
  vehicleDetail: mockDataCarDetail,
  prices: {
    original: 30,
    offer: 15,
    currency: '€',
  },
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
  .case(setParkingStartTypeAction, (state, action) => ({
    ...state,
    parkingStartType: action,
  }))
  .case(setParkingDurationTypeAction, (state, action) => ({
    ...state,
    parkingDurationType: action,
  }))
  .case(setParkingDurationPeriodAction, (state, action) => ({
    ...state,
    parkingDuration: action,
  }))
  .case(setParkingStartDateAction, (state, action) => ({
    ...state,
    parkingStartFrom: action,
  }))
  .case(fetchVehicleDetailAction, (state, action) => ({
    ...state,
    vehicleDetail: { ...mockDataCarDetail, registrationNumber: action },
  }))
  .case(setValidityPeriodAction, (state, action) => ({
    ...state,
    validityPeriod: action,
  }))
  .case(setPurchasedAction, (state, action) => ({
    ...state,
    purchased: action,
  }));

export default cartReducer;
