import {
  Button,
  Card,
  IconArrowLeft,
  IconArrowRight,
  LoadingSpinner,
} from 'hds-react';
import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomerInfo from '../../common/customerInfo/CustomerInfo';
import { UserProfileContext } from '../../hooks/userProfileProvider';
import { ROUTES } from '../../types';
import './refund.scss';

const T_PATH = 'pages.refund.Refund';

const Product: FC<{ permit: string; showDivider: boolean }> = ({
  permit,
  showDivider,
}): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <>
      <div className="order-title">{permit}</div>
      <div className="product">
        <div className="row">
          <div className="product-title">
            {t(`${T_PATH}.zone`, { zone: 'O' })}
          </div>
          <div>7,5 €/kk</div>
        </div>
        <div className="row">
          <div>26.02.2022 - 31.12.2022</div>
        </div>
        <div className="row">
          <div>{t(`${T_PATH}.monthCount`, { count: 5 })}</div>
          <strong>37,5 €</strong>
        </div>
      </div>
      {!showDivider && <div className="divider" />}
    </>
  );
};

const Summary = (): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <>
      <div className="details">
        <div className="row">
          <div>{t(`${T_PATH}.newOrder.total`)}</div>
          <div>45,5 €</div>
        </div>
        <div className="row">
          <div>{t(`${T_PATH}.previous.remaining`)}</div>
          <div>135,5 €</div>
        </div>
        <div className="divider" />
        <div className="row">
          <div>{t(`${T_PATH}.difference`)}</div>
          <div>-90,5 €</div>
        </div>
        <div>{t(`${T_PATH}.explanation`)}</div>
      </div>
      <div className="total-amounts">
        <div className="row">
          <div className="product-title">{t(`${T_PATH}.total.refund`)}</div>
          <strong>90,5 €</strong>
        </div>
        <div className="row">
          <div>{t(`${T_PATH}.vat`)}</div>
          <div>10,5 €</div>
        </div>
      </div>
    </>
  );
};

const Refund = (): React.ReactElement => {
  const { t } = useTranslation();
  const { state } = useLocation() as { state: { endingPermit: boolean } };
  const navigate = useNavigate();
  const profileCtx = useContext(UserProfileContext);

  if (!profileCtx?.getProfile()) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner small />
      </div>
    );
  }
  const permits = ['XZY-123 Skoda Octavia'];
  return (
    <div className="refund-container">
      <Card>
        <div className="refund-title">
          {t(
            `${T_PATH}.title.${
              !state?.endingPermit ? 'newOrder' : 'termination'
            }`
          )}
        </div>
        {!state?.endingPermit && (
          <div className="products">
            {permits.map((p, i) => (
              <Product key={p} permit={p} showDivider={permits.length !== i} />
            ))}
          </div>
        )}
        <Summary />
        <CustomerInfo profile={profileCtx.getProfile()} />
      </Card>
      <div className="action-buttons">
        <Button
          theme="black"
          className="action-btn"
          iconRight={<IconArrowRight />}
          onClick={() =>
            navigate(ROUTES.ACCOUNT_DETAIL, {
              state: { permitId: '1234' },
            })
          }>
          {t(`${T_PATH}.actionBtn.continue`)}
        </Button>
        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          iconLeft={<IconArrowLeft />}
          onClick={() => navigate(ROUTES.VALID_PERMITS)}>
          {t(`${T_PATH}.actionBtn.previous`)}
        </Button>
      </div>
    </div>
  );
};

export default Refund;
