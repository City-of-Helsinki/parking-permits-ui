import {
  Button,
  IconArrowLeft,
  IconArrowRight,
  IconInfoCircle,
  Link,
  TextInput,
} from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isValidIBAN } from '../utils';
import './Refund.scss';

const T_PATH = 'common.editPermits.Refund';

const CUSTOMER_SERVICE_LINKS = {
  fi: 'https://www.hel.fi/fi/kaupunkiymparisto-ja-liikenne/kaupunkiympariston-asiakaspalvelu',
  en: 'https://www.hel.fi/en/urban-environment-and-traffic/urban-environment-division-customer-services',
  sv: 'https://www.hel.fi/sv/stadsmiljo-och-trafik/stadsmiljosektorns-kundtjanst',
};

interface RefundProps {
  className?: string;
  refundTotal: number;
  refundTotalVat: number;
  onCancel: () => void;
  onConfirm: (accountNumber: string) => void;
}

const Refund: React.FC<RefundProps> = ({
  className,
  refundTotal,
  refundTotalVat,
  onCancel,
  onConfirm,
}: RefundProps) => {
  const { t, i18n } = useTranslation();
  const [accountNumber, setAccountNumber] = useState('');
  return (
    <div className={className}>
      <div className="title">{t(`${T_PATH}.title`)}</div>
      <div className="refund-info">
        <div className="row">
          <div>{t(`${T_PATH}.refundTotal`)}</div>
          <div>{parseFloat(refundTotal.toFixed(2))} €</div>
        </div>
        <div className="row">
          <div>{t(`${T_PATH}.refundTotalVat`)}</div>
          <div>{parseFloat(refundTotalVat.toFixed(2))} €</div>
        </div>
      </div>
      <div className="refund-description">
        {t(`${T_PATH}.refundDescription`)}
      </div>
      <TextInput
        className="account-number"
        id="account-number"
        label={t(`${T_PATH}.accountNumber`)}
        value={accountNumber}
        onChange={e => {
          const { target } = e;
          let position = target.selectionEnd || 0;
          const { length } = target.value;
          target.value = target.value
            .replace(/[^\dA-Z]/g, '')
            .replace(/(.{4})/g, '$1 ')
            .trim();
          position +=
            target.value.charAt(position - 1) === ' ' &&
            target.value.charAt(length - 1) === ' ' &&
            length !== target.value.length
              ? 1
              : 0;
          target.selectionEnd = position;
          setAccountNumber(e.target.value);
        }}
        errorText={
          accountNumber && !isValidIBAN(accountNumber)
            ? t(`${T_PATH}.invalidAccountNumber`)
            : undefined
        }
        successText={
          accountNumber && isValidIBAN(accountNumber)
            ? t(`${T_PATH}.validAccountNumber`)
            : undefined
        }
      />
      <div className="account-info">
        <div className="account-info-icon">
          <IconInfoCircle />
        </div>
        <div className="account-info-messages">
          <div>{t(`${T_PATH}.nonFinAcccount`)}</div>
          <div>
            <span>{t(`${T_PATH}.cityCustomerService`)}</span>
            <Link
              external
              openInNewTab
              className="contact-link"
              href={CUSTOMER_SERVICE_LINKS[i18n.language as 'fi' | 'sv' | 'en']}
              size="M">
              {t(`${T_PATH}.openingHourAndContactInfo`)}
            </Link>
          </div>
        </div>
      </div>
      <div className="action-buttons">
        <Button
          type="submit"
          className="action-btn"
          iconRight={<IconArrowRight />}
          onClick={() =>
            onConfirm(isValidIBAN(accountNumber) ? accountNumber : '')
          }
          theme="black">
          <span>{t(`${T_PATH}.actionBtn.continue`)}</span>
        </Button>
        <Button
          className="action-btn"
          variant="secondary"
          iconLeft={<IconArrowLeft />}
          onClick={() => onCancel()}
          theme="black">
          <span>{t(`${T_PATH}.actionBtn.cancel`)}</span>
        </Button>
      </div>
    </div>
  );
};

export default Refund;
