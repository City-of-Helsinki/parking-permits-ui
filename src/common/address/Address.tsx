import classNames from 'classnames';
import {
  Card,
  IconAngleDown,
  IconAngleUp,
  Notification,
  RadioButton,
} from 'hds-react';
import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PermitStateContext } from '../../hooks/permitProvider';
import { Permit, UserAddress } from '../../types';
import ParkingZonesMap from '../parkingZoneMap/ParkingZonesMap';
import { formatAddress } from '../utils';
import './address.scss';

const T_PATH = 'common.address.Address';

interface AddressHeaderProps {
  isPrimary: boolean;
  address: UserAddress;
  addressApartment: string;
}

const AddressLabel: FC<AddressHeaderProps> = ({
  isPrimary,
  address,
  addressApartment,
}) => {
  const { t, i18n } = useTranslation();
  return (
    <div className="address__headers">
      <span className="address__headers__sub_header">
        {isPrimary
          ? t(`${T_PATH}.permanentAddress`)
          : t(`${T_PATH}.temporaryAddress`)}
      </span>
      <span>{formatAddress(address, addressApartment, i18n.language)}</span>
    </div>
  );
};

interface Props {
  showControl?: boolean;
  isPrimary: boolean;
  address: UserAddress;
  selectedAddress: UserAddress | undefined;
  disableSelection?: boolean;
  addressApartment: string;
  setSelectedAddress?: (address: UserAddress) => void;
}

const Address: FC<Props> = ({
  showControl = true,
  isPrimary,
  address,
  selectedAddress,
  disableSelection = false,
  addressApartment,
  setSelectedAddress,
}): React.ReactElement => {
  const permitCtx = useContext(PermitStateContext);

  const [openState, setOpenState] = useState(true);
  const { t } = useTranslation();
  const ArrowIcon = openState ? IconAngleUp : IconAngleDown;
  const updateAddressZone = (userAddress: UserAddress) => {
    permitCtx?.setSelectedAddress(userAddress);
    if (permitCtx?.getPermits().some(p => p.id)) {
      permitCtx?.updatePermit({
        addressId: userAddress.id,
      } as Partial<Permit>);
    }
  };
  return (
    <Card
      className={classNames('address-component', {
        selected: address.id === selectedAddress?.id,
      })}>
      {showControl && (
        <div className="address">
          <RadioButton
            className="custom-radio-btn"
            id={address.id}
            name={address.id}
            value={address.id}
            disabled={!address.zone || disableSelection}
            label={
              <AddressLabel
                isPrimary={isPrimary}
                address={address}
                addressApartment={addressApartment}
              />
            }
            checked={selectedAddress?.id === address.id}
            onClick={() =>
              setSelectedAddress
                ? setSelectedAddress(address)
                : updateAddressZone(address)
            }
          />
          <ArrowIcon onClick={() => setOpenState(!openState)} />
        </div>
      )}
      {!showControl && (
        <div className="address">
          <AddressLabel
            isPrimary={isPrimary}
            address={address}
            addressApartment={addressApartment}
          />
        </div>
      )}
      <div className="zone_type">
        {t(`${T_PATH}.residentParkingZone`)} {address.zone?.name}
      </div>
      {openState && (
        <>
          {!address.zone && (
            <Notification
              className="address-warning"
              type="alert"
              label={t(`${T_PATH}.notification.error.label`)}>
              {t(`${T_PATH}.notification.error.message`)}
            </Notification>
          )}
          {address.zone && (
            <ParkingZonesMap
              userAddress={address}
              zoom={13}
              zone={address.zone}
            />
          )}
        </>
      )}
    </Card>
  );
};

export default Address;
