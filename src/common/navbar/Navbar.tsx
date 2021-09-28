import { Navigation } from 'hds-react';
import { History } from 'history';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { useClient } from '../../client/hooks';

type Page = '/' | 'apiAccessTokens' | 'userTokens' | 'profile';
type Languages = 'fi' | 'en' | 'sv';

const T_PATH = 'common.navbar.Navbar';

export interface Props {
  authenticated: boolean;
  currentStep: number;
}

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

const Navbar = ({ authenticated, currentStep }: Props): React.ReactElement => {
  const client = useClient();
  const history = useHistory();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [lang, setLang] = useState<Languages>('fi');
  const setLanguage = (code: Languages) => {
    i18n.changeLanguage(code);
    setLang(code);
  };

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
      label: t(`${T_PATH}.frontPage`),
    },
    {
      url: '/receipts',
      label: t(`${T_PATH}.receipts`),
    },
    {
      url: '/messages',
      label: t(`${T_PATH}.messages`),
    },
  ];
  if (authenticated) {
    links.push({
      url: '/profile',
      label: t(`${T_PATH}.ownProfile`),
    });
  }
  return (
    <Navigation
      title={t(`${T_PATH}.title`)}
      menuToggleAriaLabel="menu"
      skipTo="#content"
      skipToContentLabel={t(`${T_PATH}.skipToContent`)}>
      {currentStep === 1 && authenticated && (
        <Navigation.Row>
          {links.map(({ label, url }) => (
            <Navigation.Item
              key={url}
              active={active === url}
              {...makeNavigationItemProps(url, history, setActive)}
              label={label}
            />
          ))}
        </Navigation.Row>
      )}
      <Navigation.Actions>
        <Navigation.LanguageSelector label={lang.toUpperCase()}>
          <Navigation.Item
            label={t(`${T_PATH}.lang.fi`)}
            lang="fi"
            onClick={(): void => setLanguage('fi')}
          />
          <Navigation.Item
            label={t(`${T_PATH}.lang.sv`)}
            lang="sv"
            onClick={(): void => setLanguage('sv')}
          />
          <Navigation.Item
            label={t(`${T_PATH}.lang.en`)}
            lang="en"
            onClick={(): void => setLanguage('en')}
          />
        </Navigation.LanguageSelector>
        {initialized && (
          <Navigation.User
            authenticated={authenticated}
            label={t(`${T_PATH}.action.login`)}
            onSignIn={(): void => client.login()}
            userName={userName}>
            <Navigation.Item
              onClick={(): void => client.logout()}
              variant="secondary"
              label={t(`${T_PATH}.action.logout`)}
            />
          </Navigation.User>
        )}
      </Navigation.Actions>
    </Navigation>
  );
};

export default Navbar;
