import { Button, IconDocument, IconSignout, LoadingSpinner } from 'hds-react';
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
  const selectedAddress = permitCtx.getAddress();
  const currentStep = permitCtx.getStep();
  const draftPermits = permitCtx.getDraftPermits();
  const validPermits = permitCtx.getValidPermits();

  if (currentStep !== STEPPER.PURCHASED_VIEW) {
    const timeOutFor = 100;
    setTimeout(() => permitCtx.setStep(STEPPER.PURCHASED_VIEW), timeOutFor);
    return <></>;
  }

  if (draftPermits.length && queryStr.orderId) {
    setTimeout(() => {
      permitCtx?.updatePermit(
        draftPermits.map(p => p.id),
        { orderId: queryStr.orderId as string }
      );
      // eslint-disable-next-line no-magic-numbers
    }, 300);
    return <LoadingSpinner style={{ marginLeft: '50%' }} small />;
  }

  const getCurrentPurchasedPermits = () =>
    (validPermits || []).filter(permit => permit.orderId === queryStr.orderId);

  return (
    <div className="purchased-overview-component">
      <PurchaseNotification validPermits={validPermits} />
      {selectedAddress && getCurrentPurchasedPermits() && (
        <>
          <Button
            theme="black"
            variant="secondary"
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
