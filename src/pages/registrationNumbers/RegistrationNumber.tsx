import { TextInput } from 'hds-react';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { PermitStateContext } from '../../hooks/permitProvider';
import { Permit } from '../../types';
import Validate from './validate';

const T_PATH = 'pages.registrationNumbers.RegistrationNumber';

export interface Props {
  permit: Permit;
  label?: string;
  index: number;
}

const RegistrationNumber = ({ permit, index }: Props): React.ReactElement => {
  const permitCtx = useContext(PermitStateContext);
  const { t } = useTranslation();
  const [valid, setValid] = useState(false);
  const [reg, setReg] = useState(permit?.vehicle?.registrationNumber);
  const [dirty, setDirty] = useState(false);

  const inputRegistration = (event: { target: { value: string } }) => {
    const { value } = event.target;
    const isValid = new Validate().carLicensePlate(value.toUpperCase());
    setValid(isValid);
    setDirty(true);
    setReg(value);
  };

  const setRegistrationNumber = () => {
    if (valid && reg && permitCtx) {
      permitCtx?.updateVehicle(permit.id, reg);
    }
  };
  return (
    <TextInput
      id={uuidv4()}
      maxLength={7}
      value={reg}
      errorText={!valid && dirty ? t(`${T_PATH}.errorText`) : ''}
      label={t(index === 0 ? `${T_PATH}.label.first` : `${T_PATH}.label.rest`)}
      onChange={inputRegistration}
      onBlur={setRegistrationNumber}
      className="registration-input"
    />
  );
};

export default RegistrationNumber;
