import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  Button,
  Card,
  IconCheckCircle,
  IconDocument,
  IconSignout,
  Notification,
} from 'hds-react';
import { useTranslation } from 'react-i18next';

import './purchasedOverview.scss';
import {
  ParkingDurationType,
  ParkingStartType,
  Price,
  UserAddress,
  Vehicle,
} from '../../redux';
import { useClient } from '../../client/hooks';

export interface Props {
  address: UserAddress;
  vehicleDetail: Vehicle;
  prices: Price | undefined;
  parkingDurationType?: ParkingDurationType;
  parkingStartType?: ParkingStartType;
  parkingDuration?: number;
  parkingStartFrom?: Date;
}

const PurchasedOverview = ({
  address: userAddress,
  vehicleDetail,
}: Props): React.ReactElement => {
  const client = useClient();
  const history = useHistory();
  const { t } = useTranslation();
  const { registrationNumber, manufacturer, model } = vehicleDetail;
  const { address, postalCode, primary } = userAddress;

  return (
    <div className="purchased-overview-component">
      <Notification
        type="success"
        className="notification"
        label={t('page.paymentOverview.notificationTitle')}>
        {t('page.paymentOverview.notificationMessage')}
      </Notification>
      <h4 className="parking-title">
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
          <div>Alkaa: 25.6.2021 klo 00:00</div>
          <div>Päättyy: 25.2.2022 klo 00:00</div>
        </div>
        <div className="divider" />
        <IconCheckCircle />
        <div>{t('page.paymentOverview.discountMessage')}</div>
      </Card>
      <div className="action-buttons">
        <Button className="action-btn" onClick={(): void => history.push('/')}>
          <span>{t('page.paymentOverview.frontPageNavigation')}</span>
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          onClick={(): void => client.logout()}>
          <IconSignout />
          <span>{t('pageLayout.navbar.signOut')}</span>
        </Button>
      </div>
    </div>
  );
};

export default PurchasedOverview;
