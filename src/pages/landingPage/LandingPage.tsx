import { Button, LoadingSpinner } from 'hds-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { ClientContext } from '../../client/ClientProvider';
import { PermitStateContext } from '../../hooks/permitProvider';
import { ROUTES } from '../../types';
import './landingPage.scss';

const T_PATH = 'pages.landingPage.LandingPage';

const LandingPage = (): React.ReactElement => {
  const { t } = useTranslation();
  const clientCtx = useContext(ClientContext);
  const permitCtx = useContext(PermitStateContext);
  const permitStatus = permitCtx?.getStatus();
  const validPermits = permitCtx?.getValidPermits();
  const client = clientCtx?.client;
  const authenticated = client?.isAuthenticated();

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
