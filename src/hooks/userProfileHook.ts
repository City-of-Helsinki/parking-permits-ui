import { ApolloQueryResult } from '@apollo/client/core/types';
import { loader } from 'graphql.macro';
import { isEmpty } from 'lodash';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiFetchError, FetchStatus } from '../client/types';
import { GraphQLClient } from '../graphql/graphqlClient';
import {
  ProfileActions,
  ProfileQueryResult,
  UpdateLanguageResult,
  UserProfile,
} from '../types';
import { ApiAccessTokenContext } from './apiAccessTokenProvider';
import { getGqlClient } from './utils';

const useProfile = (): ProfileActions => {
  const apiTokenCtx = useContext(ApiAccessTokenContext);
  const profileGqlClient = getGqlClient() as GraphQLClient;
  const { i18n } = useTranslation();
  const [status, setStatus] = useState<FetchStatus>('waiting');
  const [profile, setProfile] = useState<UserProfile | undefined>(undefined);
  const [error, setError] = useState<ApiFetchError>();

  const hasApiToken = !isEmpty(apiTokenCtx?.getTokens());
  const profileLoaded = !isEmpty(profile);

  const updateLanguage = (lang: string) =>
    profileGqlClient.mutate<UpdateLanguageResult>({
      mutation: loader('../graphql/updateLanguage.graphql'),
      variables: { lang },
      errorPolicy: 'all',
    });

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
        i18n.changeLanguage(userProfile.language);
      }
    };
    if (hasApiToken && !profileLoaded) {
      fetchProfile();
    }
  }, [profileGqlClient, hasApiToken, profileLoaded, i18n]);

  return {
    getProfile: () => profile,
    getAddresses: () =>
      [profile?.primaryAddress, profile?.otherAddress].filter(
        address => !!address
      ),
    getStatus: () => status,
    getErrorMessage: () => {
      if (!error) {
        return undefined;
      }
      return error;
    },
    updateLanguage,
  } as ProfileActions;
};

export default useProfile;
