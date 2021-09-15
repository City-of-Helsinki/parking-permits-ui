import classNames from 'classnames';
import {
  Card,
  IconAngleDown,
  IconAngleUp,
  Notification,
  RadioButton,
} from 'hds-react';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { UserAddress } from '../../../redux';
import { setSelectedAddress } from '../../../redux/actions/permitCart';
import { formatAddress } from '../../utils';
import ParkingZonesMap from '../parkingZoneMap/ParkingZonesMap';
import './address.scss';

const T_PATH = 'common.addressSelector.address.Address';

interface AddressHeaderProps {
  isPrimary: boolean;
  address: UserAddress;
}

const AddressLabel: FC<AddressHeaderProps> = ({ isPrimary, address }) => {
  const { t, i18n } = useTranslation();
  return (
    <div className="address__headers">
      <span className="address__headers__sub_header">
        {isPrimary
          ? t(`${T_PATH}.permanentAddress`)
          : t(`${T_PATH}.temporaryAddress`)}
      </span>
      <span>{formatAddress(address, i18n.language)}</span>
    </div>
  );
};

interface Props {
  isPrimary: boolean;
  address: UserAddress;
  selectedAddress: UserAddress | undefined;
}

const Address: FC<Props> = ({
  isPrimary,
  address,
  selectedAddress,
}): React.ReactElement => {
  const dispatch = useDispatch();

  const [openState, setOpenState] = useState(true);
  const { t } = useTranslation();
  const ArrowIcon = openState ? IconAngleUp : IconAngleDown;
  return (
    <Card
      className={classNames('address-component', {
        selected: address.id === selectedAddress?.id,
      })}>
      <div className="address">
        <RadioButton
          className="custom-radio-btn"
          id={address.id}
          name={address.id}
          value={address.id}
          disabled={!address.zone}
          label={<AddressLabel isPrimary={isPrimary} address={address} />}
          checked={selectedAddress?.id === address.id}
          onClick={() => dispatch(setSelectedAddress(address))}
        />
        <ArrowIcon onClick={() => setOpenState(!openState)} />
      </div>
      <div className="zone_type">
        <span>
          {t(`${T_PATH}.residentParkingZone`)} {address.zone?.name}
        </span>
        <span>30 € / kk</span>
      </div>
      {openState && (
        <>
          {!address.zone && (
            <Notification
              className="address-warning"
              type="error"
              label={t(`${T_PATH}.notification.error.label`)}>
              {t(`${T_PATH}.notification.error.message`)}
            </Notification>
          )}
          {address.zone && <ParkingZonesMap userAddress={address} zoom={13} />}
        </>
      )}
    </Card>
  );
};

export default Address;
