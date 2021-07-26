import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RadioButton,
  IconAngleDown,
  IconAngleUp,
  Card,
  Notification,
} from 'hds-react';

import './address.scss';

import { UserAddress } from '../../../redux';
import ParkingZonesMap from '../parkingZoneMap/ParkingZonesMap';
import { setSelectedAddress } from '../../../redux/actions/permitCart';

const T_PATH = 'common.addressSelector.address.Address';

interface Props {
  address: UserAddress;
  selectedAddress: UserAddress | undefined;
}

const Address: FC<Props> = ({
  address,
  selectedAddress,
}): React.ReactElement => {
  const dispatch = useDispatch();

  const [openState, setOpenState] = useState(true);
  const { t } = useTranslation();
  return (
    <Card
      className={classNames('address-component', {
        selected: address.id === selectedAddress?.id,
      })}>
      <div className="zone__type">
        <RadioButton
          id={address.id}
          name={address.id}
          value={address.id}
          disabled={!address.zone}
          label={t(`${T_PATH}.residentParkingZone`)}
          checked={selectedAddress?.id === address.id}
          onClick={() => dispatch(setSelectedAddress(address))}
        />
        <div className="zone__type__symbol">{address.zone}</div>
      </div>
      <div className="accordion">
        <div className="accordion__headers">
          <span className="accordion__headers__sub_header">
            {address.primary
              ? t(`${T_PATH}.permanentAddress`)
              : t(`${T_PATH}.temporaryAddress`)}
          </span>
          <span>{`${address.address}, ${address.postalCode} ${address.city}`}</span>
        </div>
        {!openState ? (
          <IconAngleDown onClick={() => setOpenState(!openState)} />
        ) : (
          <IconAngleUp onClick={() => setOpenState(!openState)} />
        )}
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
