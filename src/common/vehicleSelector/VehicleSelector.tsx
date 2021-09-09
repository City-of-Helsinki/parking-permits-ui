import { Notification, NotificationType } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PermitCartState, STEPPER } from '../../redux';
import PermitPrices from './permitPrices/PermitPrices';
import RegistrationNumbers from './registrationNumbers/RegistrationNumbers';
import './vehicleSelector.scss';

const T_PATH = 'common.vehicleSelector.VehicleSelector';

export interface Props {
  cartState: PermitCartState;
}

const VehicleSelector = ({ cartState }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const {
    permits,
    currentStep,
    registrationNumbers,
    selectedAddress,
    fetchingStatus,
    error,
  } = cartState;

  // TODO: THIS SHOULD BE REPLACED BY MESSAGE FROM BACKEND
  const NOTIFICATIONS = [
    {
      type: 'success',
      label: t(`${T_PATH}.notification.success.label`),
      message: null,
    },
    {
      type: 'info',
      label: t(`${T_PATH}.notification.info.label`),
      message: t(`${T_PATH}.notification.info.message`),
    },
  ];
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
          label={notification.label}>
          {notification.message || ''}
        </Notification>
      ))}
      <div className="section-label">{t(`${T_PATH}.primaryVehicle.label`)}</div>
      {currentStep === STEPPER.VEHICLE_SELECTOR && (
        <RegistrationNumbers
          registrationNumbers={registrationNumbers}
          fetchingStatus={fetchingStatus}
          error={error}
        />
      )}
      {currentStep === STEPPER.PERMIT_PRICES &&
        registrationNumbers &&
        permits && (
          <PermitPrices registrations={registrationNumbers} permits={permits} />
        )}
    </div>
  );
};

export default VehicleSelector;
