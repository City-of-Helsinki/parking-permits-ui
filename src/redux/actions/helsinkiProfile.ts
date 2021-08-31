import { AnyAction } from 'redux';
import { loader } from 'graphql.macro';
import { ThunkDispatch } from 'redux-thunk';
import actionCreatorFactory from 'typescript-fsa';
import { ApolloQueryResult } from '@apollo/client/core/types';

import { convertQueryToData, getProfileGqlClient } from '../utils';
import { ProfileQueryResult, UserProfile } from '../types';

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
    const MY_PROFILE_QUERY = loader('../../graphql/myProfileQuery.graphql');
    const result: ApolloQueryResult<ProfileQueryResult> = await client.query({
      errorPolicy: 'all',
      query: MY_PROFILE_QUERY,
    });
    const userProfile = convertQueryToData(result);
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
          error: new Error('Query result is missing data.profile'),
          params: {},
        })
      );
    }
  };
