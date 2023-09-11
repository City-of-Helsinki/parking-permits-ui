import { IconLinkExternal, Notification, NotificationType } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Permit, PermitStatus } from '../../types';

const T_PATH = 'common.PurchaseNotification';

export interface Props {
  validPermits: Permit[];
}
const PurchaseNotification = ({ validPermits }: Props): React.ReactElement => {
  const { t } = useTranslation();
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
    const isAlertType = validPermits.some(
      permit =>
        permit.status === PermitStatus.DRAFT ||
        permit.status === PermitStatus.PAYMENT_IN_PROGRESS
    );
    if (isAlertType) {
      let translationPath = `${T_PATH}.notification.alert`;

      if (isPayment) {
        translationPath += '.payment';
      }
      if (isSecondary) {
        translationPath += '-2';
      }

      return {
        type: 'alert',
        label: t(`${translationPath}.label`),
        message: t(`${translationPath}.message`),
      };
    }
    return {
      type: 'success',
      label: t(`${T_PATH}.notification.success.label`),
      message: t(`${T_PATH}.notification.success.message`),
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
            {t(`${T_PATH}.notification.completeOrder`)}
            <IconLinkExternal style={{ marginLeft: 'var(--spacing-xs)' }} />
          </a>
        </div>
      ))}
    </Notification>
  );
};

export default PurchaseNotification;
