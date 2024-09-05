import {
  Header,
  Logo,
  logoFi,
  LanguageOption,
  WithAuthentication,
} from 'hds-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserProfileContext } from '../../hooks/userProfileProvider';
import Login from '../auth/Login';
import Logout from '../auth/Logout';

const T_PATH = 'common.navbar.Navbar';

const Navbar = (): React.ReactElement => {
  const profileCtx = useContext(UserProfileContext);
  const { t, i18n } = useTranslation();

  const languages: LanguageOption[] = [
    { label: 'Suomi', value: 'fi', isPrimary: true },
    { label: 'Svenska', value: 'sv', isPrimary: true },
    { label: 'English', value: 'en', isPrimary: true },
  ];

  const languageChangedStateAction = (code: string) => {
    i18n.changeLanguage(code).then(() => profileCtx?.updateLanguage(code));
  };

  return (
    <>
      <Header
        onDidChangeLanguage={languageChangedStateAction}
        languages={languages}>
        <Header.ActionBar
          frontPageLabel={t(`${T_PATH}.title`)}
          title={t(`${T_PATH}.title`)}
          titleAriaLabel={t(`${T_PATH}.title`)}
          titleHref="https://hel.fi"
          logo={<Logo src={logoFi} alt="City of Helsinki" />}
          logoAriaLabel={t(`${T_PATH}.title`)}>
          <Header.SimpleLanguageOptions
            languages={[languages[0], languages[1], languages[2]]}
          />
          <WithAuthentication
            AuthorisedComponent={Logout}
            UnauthorisedComponent={Login}
          />
        </Header.ActionBar>
      </Header>
    </>
  );
};

export default Navbar;
