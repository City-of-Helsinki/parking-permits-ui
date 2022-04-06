import { Notification, NotificationType } from 'hds-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet } from 'react-router-dom';
import { PermitStateContext } from '../../hooks/permitProvider';
import { ROUTES } from '../../types';
import './vehicleSelector.scss';

const T_PATH = 'pages.vehicleSelector.VehicleSelector';
const NOTIFICATIONS = [
  {
    type: 'success',
    label: `${T_PATH}.notification.success.label`,
    message: null,
  },
  {
    type: 'info',
    label: `${T_PATH}.notification.info.label`,
    message: `${T_PATH}.notification.info.message`,
  },
];

const VehicleSelector = (): React.ReactElement => {
  const { t } = useTranslation();
  const permitCtx = useContext(PermitStateContext);
  const permits = permitCtx?.getDraftPermits();
  const registrationNumbers = permits?.map(p => p.vehicle.registrationNumber);
  const selectedAddress = permitCtx?.getSelectedAddress();

  if (!selectedAddress) {
    return <Navigate to={ROUTES.ADDRESS} />;
  }

  return (
    <div className="vehicle-selector-component">
      <div className="zone__type">
        <div className="zone__type__symbol">{selectedAddress?.zone?.name}</div>
        <div className="zone__type__label">{t(`${T_PATH}.label`)}</div>
      </div>
      {NOTIFICATIONS.map(notification => (
        <Notification
          key={notification.message}
          type={notification.type as NotificationType}
          className="notification"
          label={t(notification.label)}>
          {t(notification.message || '')}
        </Notification>
      ))}
      <div className="section-label">
        {t(
          `${T_PATH}.${
            registrationNumbers && registrationNumbers.length > 1
              ? 'multiplePermitsSectionLabel'
              : 'singlePermitSectionLabel'
          }`
        )}
      </div>
      <Outlet />
    </div>
  );
};

export default VehicleSelector;
