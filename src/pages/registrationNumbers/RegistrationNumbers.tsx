import {
  Button,
  Card,
  IconArrowLeft,
  IconArrowRight,
  IconPlusCircleFill,
  LoadingSpinner,
  Notification,
} from 'hds-react';
import { sortBy } from 'lodash';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { PermitStateContext } from '../../hooks/permitProvider';
import { ROUTES, STEPPER } from '../../types';
import RegistrationNumber from './RegistrationNumber';
import './registrationNumbers.scss';
import Validate from './validate';

const T_PATH = 'pages.registrationNumbers.RegistrationNumbers';

const allRegistrationValid = (registrations: string[]) =>
  registrations.every(reg => new Validate().carLicensePlate(reg.toUpperCase()));

const RegistrationNumbers = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const permitCtx = useContext(PermitStateContext);

  const draftPermits = permitCtx?.getDraftPermits();
  const validPermits = permitCtx?.getValidPermits();
  const currentStep = permitCtx?.getStep();
  const selectedAddress = permitCtx?.getAddress();
  const fetchingStatus = permitCtx?.getStatus();

  if (currentStep !== STEPPER.VEHICLE_SELECTOR) {
    const timeOutFor = 100;
    setTimeout(() => permitCtx?.setStep(STEPPER.VEHICLE_SELECTOR), timeOutFor);
  }

  const numOfUserCars =
    (draftPermits?.length || 0) + (validPermits?.length || 0);

  const addNewPermit = async () => {
    await permitCtx?.createPermit();
  };

  if (!selectedAddress?.zone?.id) {
    return <Navigate to={ROUTES.ADDRESS} />;
  }

  const hasEmptyRegPermit = () =>
    draftPermits?.some(p => p.vehicle.registrationNumber.length === 0);
  return (
    <div className="registration-numbers-selector-component">
      <Card className="card">
        {draftPermits &&
          sortBy(draftPermits, 'id').map((permit, index) => (
            <RegistrationNumber key={uuidv4()} permit={permit} index={index} />
          ))}
        {numOfUserCars < 2 && (
          <Button
            variant="supplementary"
            style={{
              marginTop: 'var(--spacing-s)',
              color: hasEmptyRegPermit()
                ? 'var(--color-disabled)'
                : 'var(--color-coat-of-arms)',
            }}
            disabled={hasEmptyRegPermit()}
            onClick={() => addNewPermit()}
            iconLeft={<IconPlusCircleFill />}>
            {t(`${T_PATH}.btn.addMore`)}
          </Button>
        )}
      </Card>
      {fetchingStatus === 'error' && (
        <Notification
          label={t(`${T_PATH}.error.label`)}
          type="error"
          style={{ marginTop: 'var(--spacing-s)' }}>
          error
        </Notification>
      )}
      <div className="action-buttons">
        <Button
          theme="black"
          className="action-btn"
          disabled={
            !draftPermits ||
            !allRegistrationValid(
              draftPermits.map(p => p.vehicle.registrationNumber)
            ) ||
            fetchingStatus === 'loading'
          }
          onClick={() => navigate(ROUTES.PERMIT_PRICES)}>
          {fetchingStatus === 'loading' && <LoadingSpinner small />}
          {fetchingStatus !== 'loading' && (
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
          onClick={() => navigate(ROUTES.ADDRESS)}>
          <span>{t(`${T_PATH}.actionBtn.gotoAddressSelection`)}</span>
        </Button>
      </div>
    </div>
  );
};

export default RegistrationNumbers;
