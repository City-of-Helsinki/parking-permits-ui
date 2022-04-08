import { Button, LoadingSpinner } from 'hds-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { ClientContext } from '../../client/ClientProvider';
import { PermitStateContext } from '../../hooks/permitProvider';
import { UserProfileContext } from '../../hooks/userProfileProvider';
import { ROUTES } from '../../types';
import { getEnv } from '../../utils';
import './landingPage.scss';

const T_PATH = 'pages.landingPage.LandingPage';

const LandingPage = (): React.ReactElement => {
  const { t } = useTranslation();
  const clientCtx = useContext(ClientContext);
  const permitCtx = useContext(PermitStateContext);
  const profileCtx = useContext(UserProfileContext);
  const permitStatus = permitCtx?.getStatus();
  const validPermits = permitCtx?.getValidPermits();
  const client = clientCtx?.client;
  const authenticated = client?.isAuthenticated();
  const profile = profileCtx?.getProfile();
  const allowedAgeLimit = getEnv('REACT_APP_ALLOWED_AGE_LIMIT');

  if (profileCtx?.getStatus() === 'error') {
    return <div>{profileCtx.getErrorMessage()}</div>;
  }
  if (profile && profile.age < +allowedAgeLimit) {
    return <div>{t(`${T_PATH}.underAgeMessage`)}</div>;
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
          onClick={client?.login}
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
