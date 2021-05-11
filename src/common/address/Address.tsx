import React, { FC, useState } from 'react';
import classNames from 'classnames';
import { RadioButton, IconAngleDown, IconAngleUp } from 'hds-react';
import { Card } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import { UserAddress } from '../../redux';

import './address.scss';

interface Props {
  address: UserAddress;
  selectedAddressId: string;
  onChange: (event: { target: { value: string } }) => void;
}

const Address: FC<Props> = ({
  address,
  children,
  onChange,
  selectedAddressId,
}): React.ReactElement => {
  const [openState, setOpenState] = useState(true);
  const { t } = useTranslation();
  return (
    <Card>
      <div
        className={classNames('address', {
          selected: address.id === selectedAddressId,
        })}>
        <div className="address__type">
          <RadioButton
            id={address.id}
            name={address.id}
            value={address.id}
            label={t('common.address.residentParkingZone')}
            checked={selectedAddressId === address.id}
            onChange={onChange}
          />
          <div className="address__type__symbol">
            {address.primary ? 'K' : 'O'}
          </div>
        </div>
        <div className="accordion">
          <div className="accordion__headers">
            <span className="accordion__headers__sub_header">
              {address.primary
                ? t('common.address.residentParkingZone')
                : t('common.address.temporaryAddress')}
            </span>
            <span>{`${address.address}, ${address.postalCode} ${address.city}`}</span>
          </div>
          {openState ? (
            <IconAngleDown onClick={() => setOpenState(!openState)} />
          ) : (
            <IconAngleUp onClick={() => setOpenState(!openState)} />
          )}
        </div>
        {openState && children}
      </div>
    </Card>
  );
};

export default Address;
