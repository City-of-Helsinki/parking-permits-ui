import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { ProcessingStatus, TalpaState } from '../types';
import { talpaAction } from '../actions/talpa';

const initialState: TalpaState = {} as TalpaState;

const talpaReducer = reducerWithInitialState<TalpaState>(initialState)
  .case(talpaAction.started, state => ({
    ...state,
    fetchingStatus: ProcessingStatus.PROCESSING,
  }))
  .case(talpaAction.done, (state, action) => ({
    ...state,
    fetchingStatus: ProcessingStatus.SUCCESS,
    order: action.result,
  }))
  .case(talpaAction.failed, (state, action) => ({
    ...state,
    error: action.error,
    fetchingStatus: ProcessingStatus.FAILURE,
  }));

export default talpaReducer;
