import React from 'react';
import { Card, IconCheckCircle, IconDocument } from 'hds-react';
import { useTranslation } from 'react-i18next';

import './permit.scss';
import { UserAddress, ValidityPeriod, Vehicle } from '../../redux';

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
  const { address, postalCode, primary } = userAddress;
  return (
    <div className="permit-component">
      <h4 className="permit-title">
        {t('page.paymentOverview.parkingPermit')}
      </h4>
      <Card className="card">
        <div className="address__symbol">{primary ? 'K' : 'O'}</div>
        <div>
          <h5 style={{ fontSize: 'var(--fontsize-heading-xs)' }}>
            {t('page.paymentOverview.parkingZone')}
          </h5>
          <div>{`${address}, ${postalCode} Helsinki`}</div>
        </div>
        <div className="document-icon">
          <IconDocument color="var(--color-white)" />
        </div>
        <div>
          <h5 style={{ fontSize: 'var(--fontsize-heading-xs) ' }}>
            {`${registrationNumber} ${manufacturer} ${model}`}
          </h5>
          <div>{validityPeriod?.start}</div>
          <div>{validityPeriod?.end}</div>
        </div>
        <div className="divider" />
        <IconCheckCircle />
        <div>{t('page.paymentOverview.discountMessage')}</div>
      </Card>
    </div>
  );
};

export default Permit;
