import { CookieModal } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRoutes } from 'react-router-dom';
import { setClientConfig } from './client';
import clientConfig from './client/config';
import routes from './routes';

setClientConfig(clientConfig);

function App(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const routing = useRoutes(routes);
  const contentSource = {
    siteName: t('common.navbar.Navbar.title'),
    title: t('common.navbar.Navbar.title'),
    currentLanguage: i18n.language as 'fi' | 'sv' | 'en',
    optionalCookies: {
      cookies: [
        {
          commonGroup: 'statistics',
          commonCookie: 'matomo',
        },
      ],
    },
    language: {
      onLanguageChange: (code: string) => i18n.changeLanguage(code),
    },
    focusTargetSelector: '#parking-permit-app',
    // TODO: Find some way not to break the load without reloading.
    onAllConsentsGiven: () => window.location.reload(),
  };
  return (
    <>
      <div id="parking-permit-app">{routing}</div>
      <CookieModal contentSource={contentSource} />
    </>
  );
}

export default App;
