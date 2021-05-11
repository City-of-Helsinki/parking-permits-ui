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
import { isEmpty } from 'lodash';

import './vehicleSelector.scss';
import {
  setCurrentStepper,
  setRegistrationNumber,
} from '../../redux/actions/permitCart';
import { UserAddress, Vehicle } from '../../redux';

const mockData = {
  id: '1232',
  type: 'sedan',
  manufacturer: 'Toyota',
  model: 'Yaris',
  productionYear: 2020,
  registrationNumber: 'ABC-123',
  emission: 85,
  owner: '123-asd',
  holder: '123-asd',
};

export interface Props {
  registrationNumber: string | undefined;
  address: UserAddress;
}

const VehicleSelector = ({
  address,
  registrationNumber,
}: Props): React.ReactElement => {
  const [regDetail, setRegDetail] = useState({} as Vehicle);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const gotoStep = (count: number | null) => {
    if (count) {
      dispatch(setCurrentStepper(count));
    } else {
      setRegDetail(mockData);
    }
  };
  const setRegistration = (event: { target: { value: string } }) => {
    dispatch(setRegistrationNumber(event.target.value));
  };
  return (
    <div className="vehicle-selector-component">
      <div className="address">
        <div className="address__symbol">{address.primary ? 'K' : 'O'}</div>
        <div className="address__type">
          {address.primary
            ? t('common.address.residentParkingZone')
            : t('common.address.temporaryAddress')}
        </div>
      </div>
      {!isEmpty(regDetail) && (
        <Notification
          type="success"
          className="notification"
          label={t('page.vehicleSelector.notification.success.label')}>
          {t('page.vehicleSelector.notification.success.message')}
        </Notification>
      )}
      <Card className="card">
        {!isEmpty(regDetail) && (
          <div className="car-details">
            <div className="registration-number">
              {regDetail.registrationNumber}
            </div>
            <div className="car-model">
              {regDetail.manufacturer} {regDetail.model}
            </div>
            <div className="emission-level">
              {t('page.vehicleSelector.emission', {
                emission: regDetail.emission,
              })}
            </div>
            <div className="price">
              <div className="original">30€/KK</div>
              <div className="offer">15€/KK</div>
            </div>
          </div>
        )}
        {isEmpty(regDetail) && (
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
          onClick={() => gotoStep(isEmpty(regDetail) ? null : 3)}
          disabled={!registrationNumber?.length}>
          <span>{t('page.vehicleSelector.continue')}</span>
          <IconArrowRight />
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          onClick={() => gotoStep(1)}>
          <IconArrowLeft />
          <span>{t('page.vehicleSelector.returnToSelectAnAddress')}</span>
        </Button>
      </div>
    </div>
  );
};

export default VehicleSelector;
