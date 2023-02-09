import { Notification, NotificationType } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Permit, PermitStatus } from '../../types';

const T_PATH = 'common.PurchaseNotification';

export interface Props {
  validPermits: Permit[];
}
const PurchaseNotification = ({ validPermits }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const getAlert = (): {
    type: NotificationType;
    label: string;
    message: string;
  } => {
    const orderIds = validPermits.map(permit => permit.talpaOrderId);
    const uniqueOrderIds = Array.from(new Set(orderIds));
    const isSecondary = uniqueOrderIds.length > 1;
    const isAlertType = validPermits.some(
      permit =>
        permit.status === PermitStatus.DRAFT ||
        permit.status === PermitStatus.PAYMENT_IN_PROGRESS
    );
    if (isAlertType) {
      return {
        type: 'alert',
        label: t(
          `${T_PATH}.notification.alert${isSecondary ? '-2' : ''}.label`
        ),
        message: t(
          `${T_PATH}.notification.alert${isSecondary ? '-2' : ''}.message`
        ),
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
    </Notification>
  );
};

export default PurchaseNotification;
