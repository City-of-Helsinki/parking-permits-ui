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
    const orderIds = validPermits.map(permit => permit.orderId);
    const uniqueOrderIds = Array.from(new Set(orderIds));
    const isSecondary = uniqueOrderIds.length > 1;
    const hasDrafts = validPermits.some(
      permit => permit.status === PermitStatus.DRAFT
    );
    if (hasDrafts) {
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
      style={{ margin: 'var(--spacing-m) 0' }}
      label={alert.label}>
      {alert.message}
    </Notification>
  );
};

export default PurchaseNotification;
