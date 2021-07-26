import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, IconArrowRight, Notification } from 'hds-react';

import './addressSelector.scss';

import {
  setCurrentStepper,
  setSelectedAddress,
} from '../../redux/actions/permitCart';
import Address from './address/Address';
import { STEPPER, UserAddress } from '../../redux';

const T_PATH = 'common.addressSelector.AddressSelector';

export interface Props {
  addresses: UserAddress[];
  selectedAddress: UserAddress | undefined;
}

const AddressSelector = ({
  addresses,
  selectedAddress,
}: Props): React.ReactElement => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  if (!selectedAddress) {
    setTimeout(() => {
      dispatch(setSelectedAddress(addresses[0]));
    });
  }
  return (
    <div className="address-selector-component">
      <Notification label={t(`${T_PATH}.notification.info.label`)}>
        {t(`${T_PATH}.notification.info.message`)}
      </Notification>
      <div className="section-label">{t(`${T_PATH}.sectionLabel`)}</div>
      <div className="addresses">
        {addresses.map(address => (
          <Address
            key={address.id}
            address={address}
            selectedAddress={selectedAddress}
          />
        ))}
      </div>
      <div className="action-buttons">
        <Button
          className="action-btn"
          onClick={() => dispatch(setCurrentStepper(STEPPER.VEHICLE_SELECTOR))}
          theme="black">
          <span>{t(`${T_PATH}.actionBtn.buyPermit`)}</span>
          <IconArrowRight />
        </Button>
        <div />
      </div>
    </div>
  );
};

export default AddressSelector;
