import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { UserAddress } from '../../redux';
import { formatAddress } from '../utils';
import './addressLabel.scss';

const T_PATH = 'common.addressLabel';

interface AddressHeaderProps {
  address: UserAddress;
}

const AddressLabel: FC<AddressHeaderProps> = ({ address: userAddress }) => {
  const { t, i18n } = useTranslation();
  return (
    <div className="address-label-component">
      <div className="headers">
        <div className="zone__type__symbol">{userAddress?.zone?.name}</div>
        <div className="headers__label">
          <span className="headers__label__sub_label">
            {userAddress?.primary
              ? t(`${T_PATH}.permanentAddress`)
              : t(`${T_PATH}.temporaryAddress`)}
          </span>
          <span>{formatAddress(userAddress, i18n.language)}</span>
        </div>
      </div>
    </div>
  );
};

export default AddressLabel;
