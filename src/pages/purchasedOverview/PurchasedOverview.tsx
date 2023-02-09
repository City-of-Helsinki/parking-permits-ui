import { Button, IconDocument, IconSignout, LoadingSpinner } from 'hds-react';
import { first } from 'lodash';
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

  if (!clientCtx || clientCtx.client.getStatus() === 'UNAUTHORIZED') {
    return <Navigate to={ROUTES.LANDING} />;
  }

  if (!permitCtx || permitCtx.getStatus() !== 'loaded') {
    return <LoadingSpinner style={{ marginLeft: '50%' }} small />;
  }

  const client = clientCtx?.client;
  const queryStr = queryString.parse(location.search);
  const selectedAddress = permitCtx.getSelectedAddress();
  const currentStep = permitCtx.getStep();
  const validPermits = permitCtx.getValidPermits();

  if (currentStep !== STEPPER.PURCHASED_VIEW) {
    const timeOutFor = 100;
    setTimeout(() => permitCtx.setStep(STEPPER.PURCHASED_VIEW), timeOutFor);
    return <></>;
  }

  const getCurrentPurchasedPermits = () =>
    (validPermits || []).filter(
      permit =>
        permit.talpaOrderId === queryStr.orderId ||
        permit.id === queryStr.permitId
    );

  const showReceipt = () => {
    const firstPurchasedPermit = first(getCurrentPurchasedPermits());
    if (firstPurchasedPermit?.receiptUrl) {
      window.open(`${firstPurchasedPermit.receiptUrl}`, '_self');
    }
  };

  return (
    <div className="purchased-overview-component">
      <PurchaseNotification validPermits={validPermits} />
      {selectedAddress && getCurrentPurchasedPermits() && (
        <>
          <Button
            theme="black"
            variant="secondary"
            onClick={() => showReceipt()}
            className="download-receipt">
            <IconDocument />
            <span>{t(`${T_PATH}.btn.receipt`)}</span>
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
          <span>{t(`${T_PATH}.actionBtn.frontPage`)}</span>
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          onClick={(): void => client.logout()}>
          <IconSignout />
          <span>{t(`${T_PATH}.actionBtn.logout`)}</span>
        </Button>
      </div>
    </div>
  );
};

export default PurchasedOverview;
