import React from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Card, IconCheckCircle, IconDocument } from 'hds-react';

import './permit.scss';

import {
  ParkingDurationType,
  Permit as PermitModel,
  UserAddress,
} from '../../redux';

const T_PATH = 'common.permit.Permit';

export interface Props {
  address: UserAddress;
  permits: PermitModel[];
}

const Permit = ({
  address: userAddress,
  permits,
}: Props): React.ReactElement => {
  const dateFormat = 'd.M.yyyy';
  const { t } = useTranslation();
  const { address, postalCode, zone, city } = userAddress;

  const getEndTime = (permit: PermitModel) =>
    permit.startDate
      ? format(
          new Date(
            // eslint-disable-next-line no-magic-numbers
            permit.startDate.valueOf() + (permit?.duration || 0) * 24 * 3600
          ),
          dateFormat
        )
      : '';

  const getPermit = (permit: PermitModel) => {
    const { registrationNumber, manufacturer, model } = permit.vehicle;
    return (
      <div className="pp-list" key={permit.vehicle.registrationNumber}>
        <span className="document-icon">
          <IconDocument className="icon" color="var(--color-white)" />
        </span>
        <div className="pp-list__titles">
          <div className="pp-list__title">
            {`${registrationNumber} ${manufacturer} ${model}`}
          </div>
          <div className="pp-list__subtitle">
            <span>{format(permit.startDate as Date, dateFormat)}</span>
            {permit.durationType === ParkingDurationType.OPEN_ENDED && (
              <span>{t(`${T_PATH}.contractType`)}</span>
            )}
            {permit.durationType !== ParkingDurationType.OPEN_ENDED && (
              <span>{getEndTime(permit)}</span>
            )}
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="permit-component">
      <div className="section-label">{t(`${T_PATH}.label`)}</div>
      <Card className="card">
        <div className="pp-list">
          <span className="pp-list__icon">{zone}</span>
          <div className="pp-list__titles">
            <div className="pp-list__title">{t(`${T_PATH}.permitType`)}</div>
            <div className="pp-list__subtitle">{`${address}, ${postalCode} ${city}`}</div>
          </div>
        </div>
        {permits.map(permit => getPermit(permit))}
        <div className="message">
          <IconCheckCircle />
          <div>{t(`${T_PATH}.discount`)}</div>
        </div>
      </Card>
    </div>
  );
};

export default Permit;
