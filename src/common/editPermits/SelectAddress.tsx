import { Button, IconArrowLeft, IconArrowRight } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserAddress } from '../../types';
import Address from '../address/Address';
import './SelectAddress.scss';

const T_PATH = 'common.editPermits.SelectAddress';

interface SelectAddressProps {
  className?: string;
  address: UserAddress;
  onCancel: () => void;
  onConfirm: () => void;
}

const SelectAddress: React.FC<SelectAddressProps> = ({
  className,
  address,
  onCancel,
  onConfirm,
}: SelectAddressProps) => {
  const { t } = useTranslation();
  return (
    <div className={className}>
      <Address isPrimary={false} address={address} selectedAddress={address} />
      <div className="action-buttons">
        <Button
          type="submit"
          className="action-btn"
          iconRight={<IconArrowRight />}
          onClick={() => onConfirm()}
          theme="black">
          <span>{t(`${T_PATH}.actionBtn.continue`)}</span>
        </Button>
        <Button
          className="action-btn"
          variant="secondary"
          iconLeft={<IconArrowLeft />}
          onClick={() => onCancel()}
          theme="black">
          <span>{t(`${T_PATH}.actionBtn.cancel`)}</span>
        </Button>
      </div>
    </div>
  );
};

export default SelectAddress;
