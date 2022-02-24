import {
  Button,
  IconDocument,
  IconSignout,
  LoadingSpinner,
  Notification,
} from 'hds-react';
import queryString from 'query-string';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ClientContext } from '../../client/ClientProvider';
import Permit from '../../common/permit/Permit';
import PurchaseNotification from '../../common/purchaseNotification/PurchaseNotification';
import { PermitStateContext } from '../../hooks/permitProvider';
import { ROUTES, STEPPER } from '../../types';
import './purchasedOverview.scss';

const T_PATH = 'pages.purchasedOverview.PurchasedOverview';

const PurchasedOverview = (): React.ReactElement => {
  const permitCtx = useContext(PermitStateContext);
  const location = useLocation();
  const clientCtx = useContext(ClientContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { state } = useLocation() as { state: { refundId: string } };

  if (!clientCtx || clientCtx.client.getStatus() === 'UNAUTHORIZED') {
    return <Navigate to={ROUTES.LANDING} />;
  }

  if (!permitCtx || permitCtx.getStatus() !== 'loaded') {
    return <LoadingSpinner style={{ marginLeft: '50%' }} small />;
  }

  const client = clientCtx?.client;
  const queryStr = queryString.parse(location.search);
  const selectedAddress = permitCtx.getAddress();
  const currentStep = permitCtx.getStep();
  const validPermits = permitCtx.getValidPermits();

  if (!state?.refundId && currentStep) {
    const timeOutFor = 100;
    setTimeout(() => permitCtx.setStep(STEPPER.PURCHASED_VIEW), timeOutFor);
    return <></>;
  }

  const getCurrentPurchasedPermits = () =>
    (validPermits || []).filter(permit => permit.orderId === queryStr.orderId);

  return (
    <div className="purchased-overview-component">
      {state?.refundId && (
        <Notification
          type="success"
          style={{ margin: 'var(--spacing-s) 0' }}
          label="Palautus otettu käsittelyyn">
          Olemme lähettäneet vahvistusviestin sähköpostiisi
          kaisa.kooper@gmail.com. Voit tarkistaa tiedot myös alta.
        </Notification>
      )}
      <PurchaseNotification validPermits={validPermits} />
      {selectedAddress && getCurrentPurchasedPermits() && (
        <>
          <Button
            theme="black"
            variant="secondary"
            className="download-receipt">
            {!state?.refundId && <IconDocument />}
            <span>
              {t(
                `${T_PATH}.btn.${
                  state?.refundId ? 'confirmationMessage' : 'receipt'
                }`
              )}
            </span>
          </Button>
          <Permit
            address={selectedAddress}
            permits={getCurrentPurchasedPermits()}
          />
        </>
      )}
      <div className="action-buttons">
        <Button
          className="action-btn"
          theme="black"
          onClick={() => navigate(ROUTES.VALID_PERMITS)}>
          {t(`${T_PATH}.actionBtn.frontPage`)}
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          iconLeft={<IconSignout />}
          onClick={(): void => client.logout()}>
          {t(`${T_PATH}.actionBtn.logout`)}
        </Button>
      </div>
    </div>
  );
};

export default PurchasedOverview;
