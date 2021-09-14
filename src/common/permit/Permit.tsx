import { addMonths, format } from 'date-fns';
import { Card, IconCheckCircle, IconDocument } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ParkingContractType,
  Permit as PermitModel,
  UserAddress,
} from '../../redux';
import './permit.scss';

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
  const { t, i18n } = useTranslation();
  const { streetName, streetNameSv, postalCode, zone, city } = userAddress;

  const getEndTime = (permit: PermitModel) =>
    permit.startTime
      ? format(
          addMonths(
            new Date(permit.startTime as string),
            permit?.monthCount || 0
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
            <span>
              {format(new Date(permit.startTime as string), dateFormat)}
            </span>
            {permit.contractType === ParkingContractType.OPEN_ENDED && (
              <span>{t(`${T_PATH}.contractType`)}</span>
            )}
            {permit.contractType !== ParkingContractType.OPEN_ENDED && (
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
          <span className="pp-list__icon">{zone?.name}</span>
          <div className="pp-list__titles">
            <div className="pp-list__title">{t(`${T_PATH}.permitType`)}</div>
            <div className="pp-list__subtitle">{`${
              i18n.language === 'sv' ? streetNameSv : streetName
            }, ${postalCode} ${city}`}</div>
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
