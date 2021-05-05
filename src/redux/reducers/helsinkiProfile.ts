import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { HelsinkiUserProfileState, ProcessingStatus } from '../types';
import { fetchHelsinkiProfileAction } from '../actions/helsinkiProfile';

const initialState: HelsinkiUserProfileState = {
  profile: {},
} as HelsinkiUserProfileState;

const helsinkiProfileReducer = reducerWithInitialState<HelsinkiUserProfileState>(
  initialState
)
  .case(fetchHelsinkiProfileAction.started, state => ({
    ...state,
    fetchingStatus: ProcessingStatus.PROCESSING,
  }))
  .case(fetchHelsinkiProfileAction.done, (state, action) => ({
    ...state,
    fetchingStatus: ProcessingStatus.SUCCESS,
    profile: action.result,
  }))
  .case(fetchHelsinkiProfileAction.failed, (state, action) => ({
    ...state,
    error: action.error,
    fetchingStatus: ProcessingStatus.FAILURE,
  }));

export default helsinkiProfileReducer;
