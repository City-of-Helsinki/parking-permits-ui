import { addMonths, format } from 'date-fns';
import { Card, IconCheckCircle, IconDocument } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ParkingContractType,
  Permit as PermitModel,
  UserAddress,
} from '../../redux';
import { formatAddress } from '../utils';
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
  const { zone } = userAddress;

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
        <div className="pp-list__title">
          <span className="pp-list__title__icon document-icon">
            <IconDocument className="icon" />
          </span>
          <span className="pp-list__title__text">{`${registrationNumber} ${manufacturer} ${model}`}</span>
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
    );
  };
  return (
    <div className="permit-component">
      <div className="section-label">{t(`${T_PATH}.label`)}</div>
      <Card className="card">
        <div className="pp-list">
          <div className="pp-list__title">
            <span className="pp-list__title__icon">{zone?.name}</span>
            <span className="pp-list__title__text">
              {t(`${T_PATH}.permitType`)}
            </span>
          </div>
          <div className="pp-list__subtitle">
            {formatAddress(userAddress, i18n.language)}
          </div>
        </div>
        {permits.map(permit => getPermit(permit))}
        <div className="divider" />
        <div className="message">
          <IconCheckCircle />
          <div className="message-text">{t(`${T_PATH}.discount`)}</div>
        </div>
      </Card>
    </div>
  );
};

export default Permit;
