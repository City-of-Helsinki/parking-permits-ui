import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { ProcessingStatus, ZonesState } from '../types';
import { fetchZoneAction } from '../actions/zone';

const initialState: ZonesState = {
  zones: {},
} as ZonesState;

const zonesReducer = reducerWithInitialState<ZonesState>(initialState)
  .case(fetchZoneAction.started, state => ({
    ...state,
    fetchingStatus: ProcessingStatus.PROCESSING,
  }))
  .case(fetchZoneAction.done, (state, action) => ({
    ...state,
    fetchingStatus: ProcessingStatus.SUCCESS,
    zones: {
      ...state.zones,
      ...action.result,
    },
  }))
  .case(fetchZoneAction.failed, state => ({
    ...state,
    fetchingStatus: ProcessingStatus.FAILURE,
  }));

export default zonesReducer;
