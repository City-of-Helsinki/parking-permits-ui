import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, IconCheckCircle, IconDocument } from 'hds-react';

import './permit.scss';

import { UserAddress, ValidityPeriod, Vehicle } from '../../redux';

const T_PATH = 'common.permit.Permit';

export interface Props {
  address: UserAddress;
  vehicleDetail: Vehicle;
  validityPeriod: ValidityPeriod | undefined;
}

const Permit = ({
  address: userAddress,
  validityPeriod,
  vehicleDetail,
}: Props): React.ReactElement => {
  const { t } = useTranslation();
  const { registrationNumber, manufacturer, model } = vehicleDetail;
  const { address, postalCode, zone } = userAddress;
  return (
    <div className="permit-component">
      <div className="section-label">{t(`${T_PATH}.label`)}</div>
      <Card className="card">
        <div className="pp-list">
          <span className="pp-list__icon">{zone}</span>
          <div className="pp-list__titles">
            <div className="pp-list__title">{t(`${T_PATH}.permitType`)}</div>
            <div className="pp-list__subtitle">{`${address}, ${postalCode} Helsinki`}</div>
          </div>
        </div>

        <div className="pp-list">
          <span className="document-icon">
            <IconDocument className="icon" color="var(--color-white)" />
          </span>
          <div className="pp-list__titles">
            <div className="pp-list__title">
              {`${registrationNumber} ${manufacturer} ${model}`}
            </div>
            <div className="pp-list__subtitle">
              <span>{validityPeriod?.start}</span>
              <span>{t(`${T_PATH}.contractType`)}</span>
            </div>
          </div>
        </div>

        <div className="pp-list">
          <span className="document-icon">
            <IconDocument className="icon" color="var(--color-white)" />
          </span>
          <div className="pp-list__titles">
            <div className="pp-list__title">
              {`${registrationNumber} ${manufacturer} ${model}`}
            </div>
            <div className="pp-list__subtitle">
              <span>{validityPeriod?.start}</span>
              <span>{validityPeriod?.end}</span>
            </div>
          </div>
        </div>

        <div className="message">
          <IconCheckCircle />
          <div>{t(`${T_PATH}.discount`)}</div>
        </div>
      </Card>
    </div>
  );
};

export default Permit;
