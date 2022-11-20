import { Navigation } from 'hds-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientContext } from '../../client/ClientProvider';
import { UserProfileContext } from '../../hooks/userProfileProvider';

const T_PATH = 'common.navbar.Navbar';

const LANGUAGES = ['fi', 'sv', 'en'];

const Navbar = (): React.ReactElement => {
  const clientCtx = useContext(ClientContext);
  const client = clientCtx?.client;
  const authenticated = client?.isAuthenticated();
  const profileCtx = useContext(UserProfileContext);
  const { t, i18n } = useTranslation();

  const setLanguage = (code: string) => {
    i18n.changeLanguage(code).then(() => profileCtx?.updateLanguage(code));
  };

  const initialized = client?.isInitialized();
  const user = client?.getUser();
  const userName = user ? `${user.given_name} ${user.family_name}` : '';

  return (
    <>
      <Navigation
        title={t(`${T_PATH}.title`)}
        menuToggleAriaLabel="menu"
        skipTo="#content"
        skipToContentLabel={t(`${T_PATH}.skipToContent`)}>
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
