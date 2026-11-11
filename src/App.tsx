import { CookieBanner, CookieConsentContextProvider } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRoutes } from 'react-router';
import { setHDSClientConfig } from './client';
import HDSLoginConfig from './client/config';
import routes from './routes';
import useCookieConsentSettings from './hooks/useCookieConsentSettings';

setHDSClientConfig(HDSLoginConfig);

const App = (): React.ReactElement => {
  const { t } = useTranslation();
  const routing = useRoutes(routes);
  const siteName = t('common.navbar.Navbar.title');

  const cookieConsentProps = useCookieConsentSettings({ siteName });

  return (
    <CookieConsentContextProvider {...cookieConsentProps}>
      <div id="parking-permit-app">{routing}</div>
      <CookieBanner />
    </CookieConsentContextProvider>
  );
};

export default App;
