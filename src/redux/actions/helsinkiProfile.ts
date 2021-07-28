import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import actionCreatorFactory from 'typescript-fsa';

import { getProfileGqlClient } from '../utils';
import { UserProfile } from '../types';
import { getUserProfile } from './testHTTPResponse';

const creator = actionCreatorFactory('helsinkiProfile');
export const fetchHelsinkiProfileAction = creator.async<
  Record<string, unknown>,
  UserProfile,
  Error
>('fetch');

export const fetchUserProfile =
  () =>
  async (
    dispatch: ThunkDispatch<
      Record<string, unknown>,
      Record<string, unknown>,
      AnyAction
    >
  ): Promise<void> => {
    dispatch(fetchHelsinkiProfileAction.started({}));
    const client = getProfileGqlClient();
    if (!client) {
      dispatch(
        fetchHelsinkiProfileAction.failed({
          error: new Error(
            'getProfileGqlClient returned undefined. Missing ApiToken for env.REACT_APP_PROFILE_AUDIENCE or missing env.REACT_APP_PROFILE_BACKEND_URL '
          ),
          params: {},
        })
      );
      return;
    }
    const userProfile = await getUserProfile(client);
    if (userProfile) {
      dispatch(
        fetchHelsinkiProfileAction.done({
          params: {},
          result: userProfile,
        })
      );
    } else {
      dispatch(
        fetchHelsinkiProfileAction.failed({
          error: new Error('Query result is missing data.myProfile'),
          params: {},
        })
      );
    }
  };
