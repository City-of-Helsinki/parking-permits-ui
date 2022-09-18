import { Navigation } from 'hds-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath, useLocation } from 'react-router-dom';
import { ClientContext } from '../../client/ClientProvider';
import { UserProfileContext } from '../../hooks/userProfileProvider';

const T_PATH = 'common.navbar.Navbar';

const LINKS = [
  { url: '/', label: `${T_PATH}.frontPage` },
  { url: '/receipts', label: `${T_PATH}.receipts` },
  { url: '/messages', label: `${T_PATH}.messages` },
  { url: '/profile', label: `${T_PATH}.ownProfile` },
];

const LANGUAGES = ['fi', 'sv', 'en'];

export interface Props {
  showNavItems?: boolean;
}
const Navbar = ({ showNavItems = false }: Props): React.ReactElement => {
  const clientCtx = useContext(ClientContext);
  const client = clientCtx?.client;
  const authenticated = client?.isAuthenticated();
  const profileCtx = useContext(UserProfileContext);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const setLanguage = (code: string) => {
    i18n.changeLanguage(code).then(() => profileCtx?.updateLanguage(code));
  };

  const initialized = client?.isInitialized();
  const user = client?.getUser();
  const userName = user ? `${user.given_name} ${user.family_name}` : '';

  const isActiveLink = (path: string, currentPath: string): boolean =>
    !!matchPath({ path }, currentPath);

  return (
    <>
      <Navigation
        title={t(`${T_PATH}.title`)}
        menuToggleAriaLabel="menu"
        skipTo="#content"
        skipToContentLabel={t(`${T_PATH}.skipToContent`)}>
        {showNavItems && authenticated && (
          <Navigation.Row>
            {LINKS.map(({ label, url }) => (
              <Navigation.Item
                key={url}
                active={isActiveLink(url, location.pathname)}
                href={url}
                label={t(label)}
              />
            ))}
          </Navigation.Row>
        )}
        <Navigation.Actions>
          <Navigation.LanguageSelector label={i18n.language.toUpperCase()}>
            {LANGUAGES.map(lang => (
              <Navigation.Item
                key={lang}
                label={t(`${T_PATH}.lang.${lang}`)}
                lang={lang}
                onClick={(): void => setLanguage(lang)}
              />
            ))}
          </Navigation.LanguageSelector>
          {initialized && (
            <Navigation.User
              authenticated={authenticated}
              label={t(`${T_PATH}.action.login`)}
              onSignIn={(): void => client?.login()}
              userName={userName}>
              <Navigation.Item
                onClick={(): void => client?.logout()}
                variant="secondary"
                label={t(`${T_PATH}.action.logout`)}
              />
            </Navigation.User>
          )}
        </Navigation.Actions>
      </Navigation>
    </>
  );
};

export default Navbar;
