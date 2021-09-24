import {
  Button,
  Card,
  IconArrowLeft,
  IconArrowRight,
  IconPlusCircleFill,
  LoadingSpinner,
  Notification,
} from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  Permit,
  ProcessingStatus,
  STEPPER,
  UserAddress,
  UserProfile,
} from '../../../redux';
import {
  addRegistration,
  createPermit,
  setCurrentStepper,
} from '../../../redux/actions/permitCart';
import RegistrationNumber from './RegistrationNumber';
import './registrationNumbers.scss';
import Validate from './validate';

const T_PATH = 'common.vehicleSelector.registrationNumbers.RegistrationNumbers';

export interface Props {
  permits: { [registrationNumber: string]: Permit };
  selectedAddress: UserAddress;
  userProfile: UserProfile;
  numOfUserCars: number;
  registrationNumbers: string[] | undefined;
  fetchingStatus?: ProcessingStatus;
  error?: Error;
}

const allRegistrationValid = (registrations: string[]) =>
  registrations.every(reg => new Validate().carLicensePlate(reg.toUpperCase()));

const RegistrationNumbers = ({
  registrationNumbers,
  selectedAddress,
  userProfile,
  numOfUserCars,
  fetchingStatus,
  error,
  permits,
}: Props): React.ReactElement => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  if (!registrationNumbers?.length) {
    setTimeout(() => dispatch(addRegistration('')));
  }

  const fetchVehicleDetailAndPrices = () => {
    if (registrationNumbers?.length) {
      registrationNumbers.forEach(reg => {
        if (!permits[reg]) {
          dispatch(
            createPermit(
              userProfile.id,
              selectedAddress.zone?.id as string,
              reg
            )
          );
        }
      });
      dispatch(setCurrentStepper(STEPPER.PERMIT_PRICES));
    }
  };
  return (
    <div className="registration-numbers-selector-component">
      <Card className="card">
        {registrationNumbers &&
          registrationNumbers.map((reg, index) => (
            <RegistrationNumber
              key={uuidv4()}
              registration={reg}
              index={index}
            />
          ))}
        {numOfUserCars < 2 && (
          <Button
            variant="supplementary"
            style={{
              marginTop: 'var(--spacing-s)',
              color: 'var(--color-coat-of-arms)',
            }}
            onClick={() => dispatch(addRegistration(''))}
            iconLeft={<IconPlusCircleFill />}>
            {t(`${T_PATH}.btn.addMore`)}
          </Button>
        )}
      </Card>
      {fetchingStatus === ProcessingStatus.FAILURE && (
        <Notification
          label={t(`${T_PATH}.error.label`)}
          type="error"
          style={{ marginTop: 'var(--spacing-s)' }}>
          {error?.message}
        </Notification>
      )}
      <div className="action-buttons">
        <Button
          theme="black"
          className="action-btn"
          disabled={
            !registrationNumbers ||
            !allRegistrationValid(registrationNumbers) ||
            fetchingStatus === ProcessingStatus.PROCESSING
          }
          onClick={fetchVehicleDetailAndPrices}>
          {fetchingStatus === ProcessingStatus.PROCESSING && (
            <LoadingSpinner small />
          )}
          {fetchingStatus !== ProcessingStatus.PROCESSING && (
            <>
              <span>{t(`${T_PATH}.actionBtn.continue`)}</span>
              <IconArrowRight />
            </>
          )}
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          iconLeft={<IconArrowLeft />}
          onClick={() => dispatch(setCurrentStepper(STEPPER.ADDRESS_SELECTOR))}>
          <span>{t(`${T_PATH}.actionBtn.gotoAddressSelection`)}</span>
        </Button>
      </div>
    </div>
  );
};

export default RegistrationNumbers;
