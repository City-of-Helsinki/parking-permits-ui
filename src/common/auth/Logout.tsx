import { Header, useAuthenticatedUser } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const T_PATH = 'common.auth.Logout';

type UserNameClaims = Pick<
  NonNullable<ReturnType<typeof useAuthenticatedUser>>['profile'],
  'name' | 'given_name' | 'family_name' | 'preferred_username' | 'email'
>;

export const getUserDisplayName = (
  profile: UserNameClaims | null,
  fallback: string
): string => {
  const fullName = [profile?.given_name, profile?.family_name]
    .filter(Boolean)
    .join(' ');

  return (
    profile?.name ||
    fullName ||
    profile?.preferred_username ||
    profile?.email ||
    fallback
  );
};

const Logout = (): React.ReactElement => {
  const { t } = useTranslation();
  const user = useAuthenticatedUser();
  const displayName = getUserDisplayName(
    user?.profile ?? null,
    t(`${T_PATH}.user`)
  );

  return (
    <Header.UserMenuButton
      id="action-bar-user-menu"
      label={displayName}
      fixedRightPosition>
      <Header.ActionBarSubItemGroup>
        <Header.LogoutSubmenuButton
          id="action-bar-logout-action"
          label={t(`${T_PATH}.logout`)}
          errorLabel={t(`${T_PATH}.error.label`)}
          errorText={t(`${T_PATH}.error.text`)}
          errorCloseAriaLabel={t(`${T_PATH}.error.close`)}
          loggingOutText={t(`${T_PATH}.loggingOut`)}
        />
      </Header.ActionBarSubItemGroup>
    </Header.UserMenuButton>
  );
};

export default Logout;
