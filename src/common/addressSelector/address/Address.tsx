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
import ParkingZonesMap from '../parkingZoneMap/ParkingZonesMap';
import './address.scss';

const T_PATH = 'common.addressSelector.address.Address';

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
  const { t, i18n } = useTranslation();
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
        <div className="zone__type__symbol">{address.zone?.name}</div>
      </div>
      <div className="accordion">
        <div className="accordion__headers">
          <span className="accordion__headers__sub_header">
            {isPrimary
              ? t(`${T_PATH}.permanentAddress`)
              : t(`${T_PATH}.temporaryAddress`)}
          </span>
          <span>{`${
            i18n.language === 'sv' ? address.streetNameSv : address.streetName
          }, ${address.postalCode} ${
            i18n.language === 'sv' ? address.citySv : address.city
          }`}</span>
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
