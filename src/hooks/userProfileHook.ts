import { ApolloQueryResult } from '@apollo/client/core/types';
import { loader } from 'graphql.macro';
import { isEmpty } from 'lodash';
import { getApiTokensFromStorage } from 'hds-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiFetchError, FetchStatus } from '../client/types';
import { GraphQLClient } from '../graphql/graphqlClient';
import {
  ProfileActions,
  ProfileQueryResult,
  UpdateLanguageResult,
  UserProfile,
} from '../types';
import { formatErrors } from '../utils';
import { getGqlClient } from './utils';
import { useIsAuthorizationReady } from '../client/useIsAuthReady';

const useProfile = (): ProfileActions => {
  const tokens = getApiTokensFromStorage();
  const [isLoginReady, loginInProgress] = useIsAuthorizationReady();
  const profileGqlClient = getGqlClient() as GraphQLClient;
  const { i18n } = useTranslation();
  const [status, setStatus] = useState<FetchStatus>('waiting');
  const [profile, setProfile] = useState<UserProfile | undefined>(undefined);
  const [error, setError] = useState<ApiFetchError>();

  let hasApiToken = false;
  if (tokens) {
    hasApiToken = true;
  }

  const profileLoaded = !isEmpty(profile);

  const updateLanguage = (lang: string) => {
    if (profileGqlClient) {
      profileGqlClient.mutate<UpdateLanguageResult>({
        mutation: loader('../graphql/updateLanguage.graphql'),
        variables: { lang },
        errorPolicy: 'all',
      });
    }
  };

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
        setError(formatErrors(result.errors));
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
  }, [
    profileGqlClient,
    hasApiToken,
    profileLoaded,
    i18n,
    isLoginReady,
    loginInProgress,
  ]);

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
