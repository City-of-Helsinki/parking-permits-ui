import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { FeaturesState, ProcessingStatus } from '../types';
import { fetchFeaturesAction } from '../actions/features';

const initialState: FeaturesState = {
  features: {},
} as FeaturesState;

const featuresReducer = reducerWithInitialState<FeaturesState>(initialState)
  .case(fetchFeaturesAction.started, state => ({
    ...state,
    fetchingStatus: ProcessingStatus.PROCESSING,
  }))
  .case(fetchFeaturesAction.done, (state, action) => ({
    ...state,
    fetchingStatus: ProcessingStatus.SUCCESS,
    features: {
      ...state.features,
      ...action.result,
    },
  }))
  .case(fetchFeaturesAction.failed, state => ({
    ...state,
    fetchingStatus: ProcessingStatus.FAILURE,
  }));

export default featuresReducer;
