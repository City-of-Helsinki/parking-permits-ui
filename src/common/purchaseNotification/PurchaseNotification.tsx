import { IconLinkExternal, Notification, NotificationType } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Permit, PermitStatus } from '../../types';

const T_PATH = 'common.PurchaseNotification.notification';

export interface Props {
  validPermits: Permit[];
}
const PurchaseNotification = ({ validPermits }: Props): React.ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: T_PATH });
  const checkoutUrls = Array.from(
    new Set(
      validPermits
        .filter(
          permit =>
            !!permit.checkoutUrl &&
            permit.status === PermitStatus.PAYMENT_IN_PROGRESS
        )
        .map(permit => permit.checkoutUrl)
    )
  );

  const getAlert = (): {
    type: NotificationType;
    label: string;
    message: string;
  } => {
    const orderIds = validPermits.map(permit => permit.talpaOrderId);
    const uniqueOrderIds = Array.from(new Set(orderIds));
    const isSecondary = uniqueOrderIds.length > 1;
    const isPayment = checkoutUrls.length > 0;
    const isAlert = validPermits.some(
      permit =>
        permit.status === PermitStatus.DRAFT ||
        permit.status === PermitStatus.PAYMENT_IN_PROGRESS
    );

    let keyPrefix: string;

    if (isAlert) {
      keyPrefix = 'alert';

      if (isSecondary) {
        keyPrefix += '-2';
      }

      if (isPayment) {
        keyPrefix += '.payment';
      }
    } else {
      keyPrefix = 'success';
    }

    return {
      type: isAlert ? 'alert' : 'success',
      label: t(`${keyPrefix}.label`),
      message: t(`${keyPrefix}.message`),
    };
  };

  const alert = getAlert();

  return (
    <Notification
      type={alert.type}
      style={{
        marginTop: 'var(--spacing-l)',
        marginBottom: 'var(--spacing-l)',
      }}
      label={alert.label}>
      {alert.message}
      {checkoutUrls.map(url => (
        <div
          key={url}
          style={{
            marginTop: 'var(--spacing-s)',
            marginBottom: 'var(--spacing-s)',
          }}>
          <a
            href={url}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
            }}>
            {t('completeOrder')}
            <IconLinkExternal style={{ marginLeft: 'var(--spacing-xs)' }} />
          </a>
        </div>
      ))}
    </Notification>
  );
};

export default PurchaseNotification;
