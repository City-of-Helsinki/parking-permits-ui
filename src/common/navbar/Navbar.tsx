import React, { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigation } from 'hds-react';
import { History } from 'history';

import { useHistory, useLocation } from 'react-router-dom';
import { useClient } from '../../client/hooks';

type Page = '/' | 'apiAccessTokens' | 'userTokens' | 'profile';
type Languages = 'fi' | 'en' | 'sv';

export const makeNavigationItemProps = (
  url: string,
  history: History,
  setActive: Dispatch<SetStateAction<Page>>
): { href: string; onClick: (e: React.MouseEvent) => void } => ({
  href: url,
  onClick: (e: React.MouseEvent) => {
    e.preventDefault();
    history.push(url);
    setActive(url as SetStateAction<Page>);
  },
});

const Navbar = (): React.ReactElement => {
  const client = useClient();
  const history = useHistory();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [lang, setLang] = useState<Languages>('fi');
  const setLanguage = (code: Languages) => {
    i18n.changeLanguage(code);
    setLang(code);
  };

  const authenticated = client.isAuthenticated();
  const initialized = client.isInitialized();
  const user = client.getUser();
  const userName = user ? `${user.given_name} ${user.family_name}` : '';

  const currentPageFromPath: Page =
    location.pathname && location.pathname.length > 1
      ? (location.pathname.substr(1) as Page)
      : '/';
  const [active, setActive] = useState<Page>(currentPageFromPath);

  const links = [
    {
      url: '/',
      label: t('pageLayout.navbar.frontPage'),
    },
    {
      url: '/messages',
      label: t('pageLayout.navbar.messages'),
    },
  ];
  if (authenticated) {
    links.push({
      url: '/profile',
      label: t('pageLayout.navbar.ownProfile'),
    });
  }
  return (
    <Navigation
      title={t('pageLayout.title')}
      menuToggleAriaLabel="menu"
      skipTo="#content"
      skipToContentLabel={t('pageLayout.navbar.skipToContent')}>
      <Navigation.Row variant="inline">
        {links.map(({ label, url }) => (
          <Navigation.Item
            key={url}
            active={active === url}
            {...makeNavigationItemProps(url, history, setActive)}
            label={label}
          />
        ))}
      </Navigation.Row>
      <Navigation.Actions>
        <Navigation.LanguageSelector label={lang.toUpperCase()}>
          <Navigation.Item
            label="Suomeksi"
            onClick={(): void => setLanguage('fi')}
          />
          <Navigation.Item
            label="På svenska"
            onClick={(): void => setLanguage('sv')}
          />
          <Navigation.Item
            label="In English"
            onClick={(): void => setLanguage('en')}
          />
        </Navigation.LanguageSelector>
        {initialized && (
          <Navigation.User
            authenticated={authenticated}
            label={t('pageLayout.navbar.signIn')}
            onSignIn={(): void => client.login()}
            userName={userName}>
            <Navigation.Item
              onClick={(): void => client.logout()}
              variant="secondary"
              label={t('pageLayout.navbar.signOut')}
            />
          </Navigation.User>
        )}
      </Navigation.Actions>
    </Navigation>
  );
};

export default Navbar;
