import { Notification, NotificationType } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PermitCartState, STEPPER, UserProfile } from '../../redux';
import PermitPrices from './permitPrices/PermitPrices';
import RegistrationNumbers from './registrationNumbers/RegistrationNumbers';
import './vehicleSelector.scss';

const T_PATH = 'common.vehicleSelector.VehicleSelector';

export interface Props {
  cartState: PermitCartState;
  userProfile: UserProfile;
}

const VehicleSelector = ({
  cartState,
  userProfile,
}: Props): React.ReactElement => {
  const { t } = useTranslation();
  const {
    permits,
    currentStep,
    registrationNumbers,
    validRegistrationNumbers,
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
  const numOfUserCars = () =>
    [...(registrationNumbers || []), ...(validRegistrationNumbers || [])]
      .length;

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
      <div className="section-label">
        {t(
          `${T_PATH}.${
            registrationNumbers && registrationNumbers.length > 1
              ? 'multiplePermitsSectionLabel'
              : 'singlePermitSectionLabel'
          }`
        )}
      </div>
      {currentStep === STEPPER.VEHICLE_SELECTOR &&
        permits &&
        selectedAddress && (
          <RegistrationNumbers
            numOfUserCars={numOfUserCars()}
            permits={permits}
            selectedAddress={selectedAddress}
            userProfile={userProfile}
            registrationNumbers={registrationNumbers}
            fetchingStatus={fetchingStatus}
            error={error}
          />
        )}
      {currentStep === STEPPER.PERMIT_PRICES &&
        registrationNumbers &&
        permits && (
          <PermitPrices
            userProfile={userProfile}
            registrations={registrationNumbers}
            permits={permits}
          />
        )}
    </div>
  );
};

export default VehicleSelector;
