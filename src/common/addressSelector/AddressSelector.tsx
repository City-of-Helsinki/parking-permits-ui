import { Button, IconArrowRight, Notification } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { STEPPER, UserAddress } from '../../redux';
import {
  setCurrentStepper,
  setSelectedAddress,
} from '../../redux/actions/permitCart';
import Address from './address/Address';
import './addressSelector.scss';

const T_PATH = 'common.addressSelector.AddressSelector';

export interface Props {
  primaryAddress: UserAddress;
  otherAddress: UserAddress;
  selectedAddress: UserAddress | undefined;
  validRegistrations: string[];
}

const AddressSelector = ({
  primaryAddress,
  otherAddress,
  selectedAddress,
  validRegistrations,
}: Props): React.ReactElement => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  if (!selectedAddress) {
    setTimeout(() => {
      dispatch(setSelectedAddress(primaryAddress));
    });
  }
  return (
    <div className="address-selector-component">
      <Notification label={t(`${T_PATH}.notification.info.label`)}>
        {t(`${T_PATH}.notification.info.message`)}
      </Notification>
      <div className="section-label">{t(`${T_PATH}.sectionLabel`)}</div>
      <div className="addresses">
        <Address
          isPrimary
          disableSelection={validRegistrations.length > 0}
          address={primaryAddress}
          selectedAddress={selectedAddress}
        />
        {otherAddress && (
          <Address
            isPrimary={false}
            address={otherAddress}
            disableSelection={validRegistrations.length > 0}
            selectedAddress={selectedAddress}
          />
        )}
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
