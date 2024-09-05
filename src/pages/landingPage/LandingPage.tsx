import {
  Button,
  IconSignout,
  LoadingSpinner,
  Notification,
  useOidcClient,
} from 'hds-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PermitStateContext } from '../../hooks/permitProvider';
import { UserProfileContext } from '../../hooks/userProfileProvider';
import { ROUTES } from '../../types';
import { getEnv } from '../../utils';
import './landingPage.scss';

const T_PATH = 'pages.landingPage.LandingPage';

const LandingPage = (): React.ReactElement => {
  const { t } = useTranslation();
  const { login, logout, isAuthenticated } = useOidcClient();
  const permitCtx = useContext(PermitStateContext);
  const profileCtx = useContext(UserProfileContext);
  const permitStatus = permitCtx?.getStatus();
  const validPermits = permitCtx?.getValidPermits();
  const authenticated = isAuthenticated();
  const profile = profileCtx?.getProfile();
  const allowedAgeLimit = getEnv('REACT_APP_ALLOWED_AGE_LIMIT');

  if (profileCtx?.getStatus() === 'error') {
    return (
      <Notification type="error">
        {profileCtx?.getErrorMessage() || ''}
      </Notification>
    );
  }
  if (profile && profile.age < +allowedAgeLimit) {
    return (
      <>
        <Notification type="alert" label={t(`${T_PATH}.underAgeLabel`)}>
          {t(`${T_PATH}.underAgeMessage`)}
        </Notification>
        <Button
          className="logout-button"
          theme="black"
          iconLeft={<IconSignout />}
          onClick={() => logout()}>
          {t(`${T_PATH}.logout`)}
        </Button>
      </>
    );
  }

  if (
    profileCtx?.getStatus() === 'loaded' &&
    !profile?.primaryAddress &&
    !profile?.otherAddress
  ) {
    return (
      <>
        <Notification type="alert" label={t(`${T_PATH}.noValidAddressLabel`)}>
          {t(`${T_PATH}.noValidAddressMessage`)}
        </Notification>
        <Button
          className="logout-button"
          theme="black"
          iconLeft={<IconSignout />}
          onClick={() => logout()}>
          {t(`${T_PATH}.logout`)}
        </Button>
      </>
    );
  }

  if (permitCtx?.getStatus() === 'error') {
    return (
      <Notification type="error">
        {t(permitCtx?.getErrorMessage() || '')}
      </Notification>
    );
  }

  if (permitStatus === 'loaded') {
    return validPermits?.length ? (
      <Navigate to={ROUTES.VALID_PERMITS} />
    ) : (
      <Navigate to={ROUTES.ADDRESS} />
    );
  }
  return (
    <div className="landing-page">
      {authenticated && <LoadingSpinner style={{ marginLeft: '50%' }} small />}
      {!authenticated && (
        <Button
          onClick={() => login()}
          className="login-button"
          size="small"
          theme="black">
          {t(`${T_PATH}.login`)}
        </Button>
      )}
    </div>
  );
};

export default LandingPage;
