import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { CoordinatesState, ProcessingStatus } from '../types';
import { fetchCoordinatesAction } from '../actions/coordinates';

const initialState: CoordinatesState = {
  coordinates: {},
} as CoordinatesState;

const coordinatesReducer = reducerWithInitialState<CoordinatesState>(
  initialState
)
  .case(fetchCoordinatesAction.started, state => ({
    ...state,
    fetchingStatus: ProcessingStatus.PROCESSING,
  }))
  .case(fetchCoordinatesAction.done, (state, action) => ({
    ...state,
    fetchingStatus: ProcessingStatus.SUCCESS,
    coordinates: {
      ...state.coordinates,
      ...action.result,
    },
  }))
  .case(fetchCoordinatesAction.failed, state => ({
    ...state,
    fetchingStatus: ProcessingStatus.FAILURE,
  }));

export default coordinatesReducer;
