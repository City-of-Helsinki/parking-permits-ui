import {
  CookieBanner,
  CookieConsentContextProvider,
  CookieConsentChangeEvent,
} from 'hds-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoutes } from 'react-router';
import { setHDSClientConfig } from './client';
import HDSLoginConfig from './client/config';
import siteSettingsBase from './common/cookieConsent/siteSettings.json';
import routes from './routes';

setHDSClientConfig(HDSLoginConfig);

// TODO: Find some way not to break the load without reloading.
const onConsentChange = ({ acceptedGroups }: CookieConsentChangeEvent) => {
  if (acceptedGroups.includes('statistics')) {
    window.location.reload();
  }
};

const App = (): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const routing = useRoutes(routes);
  const siteName = t('common.navbar.Navbar.title');
  const siteSettings = useMemo(
    () => ({ ...siteSettingsBase, siteName }),
    [siteName]
  );
  return (
    <CookieConsentContextProvider
      siteSettings={siteSettings}
      options={{
        language: i18n.language,
        focusTargetSelector: '#parking-permit-app',
      }}
      onChange={onConsentChange}>
      <div id="parking-permit-app">{routing}</div>
      <CookieBanner />
    </CookieConsentContextProvider>
  );
};

export default App;
