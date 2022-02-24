import {
  Button,
  Card,
  IconArrowRight,
  IconInfoCircle,
  IconLinkExternal,
  Link,
  TextInput,
} from 'hds-react';
import { electronicFormatIBAN, extractIBAN } from 'ibantools';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { ROUTES } from '../../types';
import './accountDetail.scss';

const T_PATH = 'pages.accountDetail.AccountDetail';

const AccountDetail = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [iban, setIban] = useState('');
  const [valid, setValid] = useState(false);
  const [dirty, setDirty] = useState(false);
  const { state } = useLocation() as { state: { permitId: boolean } };

  if (!state?.permitId) {
    return <Navigate to={ROUTES.VALID_PERMITS} />;
  }
  const inputIban = (event: { target: { value: string } }) => {
    const { value } = event.target;
    const electronicFormat = electronicFormatIBAN(value) || '';
    const ibanResult = extractIBAN(electronicFormat);
    const isValid =
      !value || (ibanResult.valid && ibanResult.countryCode === 'FI');
    setValid(isValid);
    setDirty(true);
    setIban(value);
  };

  return (
    <div className="account-detail-component">
      <Card>
        <div className="title">{t(`${T_PATH}.label`)}</div>
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
        <p>{t(`${T_PATH}.message`)}</p>
        <TextInput
          id={uuidv4()}
          maxLength={40}
          value={iban}
          errorText={!valid && dirty ? t(`${T_PATH}.errorText`) : ''}
          label={t(`${T_PATH}.accountLabel`)}
          onChange={inputIban}
          onBlur={inputIban}
          required
        />
        <div
          style={{
            margin: 'var(--spacing-xs) 0',
            display: 'flex',
          }}>
          <IconInfoCircle />
          <div style={{ marginLeft: 'var(--spacing-xs)' }}>
            {t(`${T_PATH}.nonFinnInfo`)}
          </div>
        </div>
        <Link
          style={{ marginLeft: 'var(--spacing-l)' }}
          openInNewTab
          href={t(`${T_PATH}.customerService.link`)}
          iconLeft={<IconLinkExternal size="xs" />}>
          {t(`${T_PATH}.customerService.label`)}
        </Link>
      </Card>
      <div className="action-buttons">
        <Button
          theme="black"
          className="action-btn"
          iconRight={<IconArrowRight />}
          onClick={() =>
            navigate(ROUTES.SUCCESS, {
              state: { refundId: '1123' },
            })
          }>
          {t(`${T_PATH}.actionBtn.continue`)}
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          onClick={() =>
            navigate(ROUTES.SUCCESS, {
              state: { refundId: '1123' },
            })
          }>
          {t(`${T_PATH}.actionBtn.skip`)}
        </Button>
      </div>
    </div>
  );
};

export default AccountDetail;
