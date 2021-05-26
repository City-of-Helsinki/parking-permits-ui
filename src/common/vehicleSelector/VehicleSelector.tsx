import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Card,
  Button,
  IconArrowLeft,
  IconArrowRight,
  TextInput,
  Notification,
} from 'hds-react';
import { useTranslation } from 'react-i18next';

import './vehicleSelector.scss';
import {
  fetchVehicleDetail,
  setCurrentStepper,
} from '../../redux/actions/permitCart';
import { Price, UserAddress, Vehicle } from '../../redux';

export interface Props {
  address: UserAddress;
  prices: Price | undefined;
  vehicleDetail: Vehicle | undefined;
}

const VehicleSelector = ({
  address,
  prices,
  vehicleDetail,
}: Props): React.ReactElement => {
  const [regNumber, setRegNumber] = useState(vehicleDetail?.registrationNumber);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const {
    registrationNumber,
    model,
    manufacturer,
    emission,
  } = vehicleDetail || {
    registrationNumber: null,
    model: null,
    manufacturer: null,
    emission: null,
  };
  const { original, offer, currency } = prices || {
    original: null,
    offer: null,
    currency: null,
  };

  const gotoStep = (count: number) => {
    if (count === 1 && regNumber) {
      dispatch(fetchVehicleDetail(undefined));
      setRegNumber(undefined);
    } else {
      dispatch(setCurrentStepper(count));
    }
  };
  const setRegistration = (event: { target: { value: string } }) => {
    setRegNumber(event.target.value);
  };
  const fetchCarDetail = (reg: string | undefined) => {
    if (reg) {
      dispatch(fetchVehicleDetail(reg));
    }
  };
  return (
    <div className="vehicle-selector-component">
      <div className="address">
        <div className="address__symbol">{address.primary ? 'K' : 'O'}</div>
        <div className="address__type">
          {t('common.address.residentParkingZone')}
        </div>
      </div>
      {registrationNumber && (
        <Notification
          type="success"
          className="notification"
          label={t('page.vehicleSelector.notification.success.label')}>
          {t('page.vehicleSelector.notification.success.message')}
        </Notification>
      )}
      <Card className="card">
        {vehicleDetail && registrationNumber && (
          <div className="car-details">
            <div className="registration-number">{registrationNumber}</div>
            <div className="car-model">
              {manufacturer} {model}
            </div>
            <div className="emission-level">
              {t('page.vehicleSelector.emission', { emission })}
            </div>
            <div className="price">
              <div className="original">{`${original}${currency}/KK`}</div>
              <div className="offer">{`${offer}${currency}/KK`}</div>
            </div>
          </div>
        )}
        {!registrationNumber && (
          <TextInput
            id="input-invalid"
            label={t('page.vehicleSelector.enterVehicleRegistrationNumber')}
            onChange={setRegistration}
            style={{ marginTop: 'var(--spacing-s)' }}
          />
        )}
      </Card>
      <div className="action-buttons">
        <Button
          className="action-btn"
          onClick={() =>
            !registrationNumber ? fetchCarDetail(regNumber) : gotoStep(3)
          }
          disabled={!regNumber?.length}>
          <span>{t('page.vehicleSelector.continue')}</span>
          <IconArrowRight />
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          onClick={() => gotoStep(1)}>
          <IconArrowLeft />
          <span>
            {t(
              `page.vehicleSelector.${
                !registrationNumber?.length
                  ? 'returnToSelectAnAddress'
                  : 'returnToSelectRegistration'
              }`
            )}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default VehicleSelector;
