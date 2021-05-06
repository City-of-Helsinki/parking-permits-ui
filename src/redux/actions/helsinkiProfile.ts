import { AnyAction } from 'redux';
import { loader } from 'graphql.macro';
import actionCreatorFactory from 'typescript-fsa';
import { ThunkDispatch } from 'redux-thunk';
import { ApolloQueryResult } from '@apollo/client/core/types';

import { ProfileQueryResult, UserProfile } from '../types';
import { convertQueryToData, getProfileGqlClient } from '../utils';
import { fetchFeatures } from './features';

const creator = actionCreatorFactory('helsinkiProfile');
export const fetchHelsinkiProfileAction = creator.async<
  Record<string, unknown>,
  UserProfile,
  Error
>('fetch');

export const fetchUserProfile = () => async (
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
  try {
    const MY_PROFILE_QUERY = loader('../../graphql/MyProfileQuery.graphql');
    const result: ApolloQueryResult<ProfileQueryResult> = await client.query({
      errorPolicy: 'all',
      query: MY_PROFILE_QUERY,
    });
    const data = convertQueryToData(result);
    if (data) {
      Object.values(data.addresses).forEach(address =>
        dispatch(fetchFeatures(address))
      );
      dispatch(
        fetchHelsinkiProfileAction.done({
          params: {},
          result: data,
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
  } catch (error) {
    dispatch(
      fetchHelsinkiProfileAction.failed({
        error,
        params: {},
      })
    );
  }
};
