import {
  Button,
  IconDocument,
  IconSignout,
  LoadingSpinner,
  Notification,
} from 'hds-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { ClientContext } from '../../client/ClientProvider';
import Permit from '../../common/permit/Permit';
import { PermitStateContext } from '../../hooks/permitProvider';
import { ROUTES, STEPPER } from '../../types';
import './purchasedOverview.scss';

const T_PATH = 'pages.purchasedOverview.PurchasedOverview';

const PurchasedOverview = (): React.ReactElement => {
  const permitCtx = useContext(PermitStateContext);
  const clientCtx = useContext(ClientContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const client = clientCtx?.client;
  const selectedAddress = permitCtx?.getAddress();
  const currentStep = permitCtx?.getStep();
  const permits = permitCtx?.getDraftPermits();

  if (currentStep !== STEPPER.PURCHASED_VIEW) {
    const timeOutFor = 100;
    setTimeout(() => permitCtx?.setStep(STEPPER.PURCHASED_VIEW), timeOutFor);
  }

  if (client?.getStatus() === 'UNAUTHORIZED') {
    return <Navigate to={ROUTES.LANDING} />;
  }

  if (!permits?.length) {
    return <LoadingSpinner style={{ marginLeft: '50%' }} small />;
  }

  return (
    <div className="purchased-overview-component">
      <Notification
        type="success"
        className="notification"
        label={t(`${T_PATH}.notification.success.label`)}>
        {t(`${T_PATH}.notification.success.message`)}
      </Notification>
      {selectedAddress && permits && (
        <>
          <Button
            theme="black"
            variant="secondary"
            className="download-receipt">
            <IconDocument />
            <span>{t(`${T_PATH}.btn.receipt`)}</span>
          </Button>
          <Permit address={selectedAddress} permits={permits} />
        </>
      )}
      <div className="action-buttons">
        <Button
          className="action-btn"
          theme="black"
          onClick={() => navigate(ROUTES.VALID_PERMITS)}>
          <span>{t(`${T_PATH}.actionBtn.frontPage`)}</span>
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          onClick={(): void => client?.logout()}>
          <IconSignout />
          <span>{t(`${T_PATH}.actionBtn.logout`)}</span>
        </Button>
      </div>
    </div>
  );
};

export default PurchasedOverview;
