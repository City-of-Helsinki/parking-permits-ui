import React, { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigation } from 'hds-react';
import { History } from 'history';

import { useHistory, useLocation } from 'react-router-dom';
import { useClient } from '../../client/hooks';

type Page = '/' | 'apiAccessTokens' | 'userTokens' | 'profile';

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
  const authenticated = client.isAuthenticated();
  const initialized = client.isInitialized();
  const user = client.getUser();
  const history = useHistory();
  const userName = user ? `${user.given_name} ${user.family_name}` : '';

  const location = useLocation();
  const currentPageFromPath: Page =
    location.pathname && location.pathname.length > 1
      ? (location.pathname.substr(1) as Page)
      : '/';

  const [active, setActive] = useState<Page>(currentPageFromPath);

  const { t } = useTranslation();
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
