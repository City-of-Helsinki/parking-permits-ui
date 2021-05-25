import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, IconArrowRight, Notification } from 'hds-react';
import { Features, UserAddress } from '../../redux';
import ParkingZonesMap from '../parkingZoneMap/ParkingZonesMap';
import Address from '../address/Address';

import './addressSelector.scss';
import {
  setCurrentStepper,
  setSelectedAddressId,
} from '../../redux/actions/permitCart';

export interface Props {
  selectedAddressId: string;
  features: Features;
  addresses: UserAddress[];
}

const AddressSelector = ({
  features,
  addresses,
  selectedAddressId,
}: Props): React.ReactElement => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const onChange = (event: { target: { value: string } }) => {
    dispatch(setSelectedAddressId(event.target.value));
  };

  const gotoNext = () => {
    dispatch(setCurrentStepper(2));
  };
  return (
    <div className="address-selector-component">
      <Notification
        className="notification"
        label={t('page.frontPage.notification.info.label')}>
        {t('page.frontPage.notification.info.message')}
      </Notification>
      <div className="select-address-title">
        {t('page.frontPage.selectAddress')}
      </div>
      <div className="addresses">
        {addresses?.length &&
          addresses.map(address => (
            <Address
              key={address.id}
              selectedAddressId={selectedAddressId}
              address={address}
              onChange={onChange}>
              {features[address.id] && (
                <ParkingZonesMap
                  featureCollection={features[address.id]}
                  zoom={13}
                />
              )}
            </Address>
          ))}
      </div>
      <div className="action-buttons">
        <Button className="action-btn" onClick={gotoNext}>
          <span>{t('page.frontPage.buyParkingId')}</span>
          <IconArrowRight />
        </Button>
      </div>
    </div>
  );
};

export default AddressSelector;
