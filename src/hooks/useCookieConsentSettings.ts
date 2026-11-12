/* eslint-disable no-underscore-dangle */
import { CookieConsentChangeEvent, CookieConsentReactProps } from 'hds-react';

import siteSettingsBase from './data/siteSettings.json';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export enum COOKIE_CONSENT_GROUP {
  Tunnistamo = 'tunnistamo',
  Shared = 'shared',
  Statistics = 'statistics',
}

type Props = {
  siteName: string;
};

const useCookieConsentSettings = ({ siteName }: Props) => {
  const { i18n } = useTranslation();

  const siteSettings = useMemo(
    () => ({ ...siteSettingsBase, siteName }),
    [siteName]
  );

  const cookieConsentProps: CookieConsentReactProps = {
    onChange: (changeEvent: CookieConsentChangeEvent) => {
      if (!window._paq) return;

      const { acceptedGroups } = changeEvent;

      const hasStatisticsConsent =
        acceptedGroups.indexOf(COOKIE_CONSENT_GROUP.Statistics) > -1;

      if (hasStatisticsConsent) {
        //  start tracking
        window._paq.push(['setConsentGiven']);
        window._paq.push(['setCookieConsentGiven']);
      } else {
        // tell matomo to forget conset
        window._paq.push(['forgetConsentGiven']);
      }
    },
    siteSettings,
    options: {
      focusTargetSelector: '#parking-permit-app',
      language: i18n.language,
    },
  };

  return cookieConsentProps;
};

export default useCookieConsentSettings;
