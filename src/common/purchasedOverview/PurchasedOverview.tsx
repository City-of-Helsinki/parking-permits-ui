import React from 'react';
import { useDispatch } from 'react-redux';
import { Button, IconDocument, IconSignout, Notification } from 'hds-react';
import { useTranslation } from 'react-i18next';

import './purchasedOverview.scss';
import {
  ParkingDurationType,
  ParkingStartType,
  Price,
  UserAddress,
  ValidityPeriod,
  Vehicle,
} from '../../redux';
import { useClient } from '../../client/hooks';
import { setCurrentStepper } from '../../redux/actions/permitCart';
import Permit from '../permit/Permit';

export interface Props {
  address: UserAddress;
  vehicleDetail: Vehicle;
  prices: Price | undefined;
  validityPeriod: ValidityPeriod | undefined;
  parkingDurationType?: ParkingDurationType;
  parkingStartType?: ParkingStartType;
  parkingDuration?: number;
  parkingStartFrom?: Date;
}

const PurchasedOverview = ({
  address,
  validityPeriod,
  vehicleDetail,
}: Props): React.ReactElement => {
  const client = useClient();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const gotoStep = (count: number) => {
    dispatch(setCurrentStepper(count));
  };
  return (
    <div className="purchased-overview-component">
      <Notification
        type="success"
        className="notification"
        label={t('page.paymentOverview.notificationTitle')}>
        {t('page.paymentOverview.notificationMessage')}
      </Notification>
      <Button
        theme="black"
        variant="secondary"
        style={{ width: '100%', marginTop: '16px', background: 'white' }}>
        <IconDocument />
        <span>{t('page.paymentOverview.receipt')}</span>
      </Button>
      <Permit
        address={address}
        vehicleDetail={vehicleDetail}
        validityPeriod={validityPeriod}
      />
      <div className="action-buttons">
        <Button
          className="action-btn"
          theme="black"
          onClick={() => gotoStep(1)}>
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
