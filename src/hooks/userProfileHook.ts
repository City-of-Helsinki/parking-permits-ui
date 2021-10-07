import { ApolloQueryResult } from '@apollo/client/core/types';
import { loader } from 'graphql.macro';
import { isEmpty } from 'lodash';
import { useContext, useEffect, useState } from 'react';
import { ApiFetchError, FetchStatus } from '../client/types';
import { GraphQLClient } from '../graphql/graphqlClient';
import {
  PARKING_PERMIT_TOKEN,
  ProfileActions,
  ProfileQueryResult,
  UserProfile,
} from '../types';
import { ApiAccessTokenContext } from './apiAccessTokenProvider';
import { getProfileGqlClient } from './utils';

const useProfile = (): ProfileActions => {
  const apiTokenCtx = useContext(ApiAccessTokenContext);
  const profileGqlClient = getProfileGqlClient() as GraphQLClient;
  const [status, setStatus] = useState<FetchStatus>('waiting');
  const [profile, setProfile] = useState<UserProfile | undefined>(undefined);
  const [error, setError] = useState<ApiFetchError>();

  const hasApiToken = !isEmpty(apiTokenCtx?.getTokens());
  const profileLoaded = !isEmpty(profile);

  useEffect(() => {
    const fetchProfile = async () => {
      setStatus('loading');
      const MY_PROFILE_QUERY = loader('../graphql/myProfileQuery.graphql');
      const result: ApolloQueryResult<ProfileQueryResult> =
        await profileGqlClient?.query({
          errorPolicy: 'all',
          query: MY_PROFILE_QUERY,
        });
      if (result.errors) {
        setStatus('error');
        setError(result.errors.map(err => err.message).join('\n'));
      } else {
        setError(undefined);
        const { profile: userProfile } = result.data;
        setStatus('loaded');
        setProfile(userProfile);
        sessionStorage.setItem(PARKING_PERMIT_TOKEN, userProfile?.token);
      }
    };
    if (hasApiToken && !profileLoaded) {
      fetchProfile();
    }
  }, [profileGqlClient, hasApiToken, profileLoaded]);

  return {
    getProfile: () => profile,
    getStatus: () => status,
    getErrorMessage: () => {
      if (!error) {
        return undefined;
      }
      return error;
    },
  } as ProfileActions;
};

export default useProfile;