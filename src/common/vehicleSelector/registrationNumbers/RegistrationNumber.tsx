import { v4 as uuidv4 } from 'uuid';
import { TextInput } from 'hds-react';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Validate from './validate';
import { setRegistration } from '../../../redux/actions/permitCart';

const T_PATH = 'common.vehicleSelector.registrationNumbers.RegistrationNumber';

export interface Props {
  registration?: string;
  label?: string;
  index: number;
}

const RegistrationNumber = ({
  registration,
  index,
}: Props): React.ReactElement => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [valid, setValid] = useState(false);
  const [reg, setReg] = useState(registration);
  const [dirty, setDirty] = useState(false);

  const inputRegistration = (event: { target: { value: string } }) => {
    const { value } = event.target;
    const isValid = new Validate().carLicensePlate(value.toUpperCase());
    setValid(isValid);
    setDirty(true);
    setReg(value);
  };

  const setRegistrationNumber = () => {
    if (valid && reg) {
      dispatch(setRegistration(reg, index));
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
      style={{ width: '330px', marginTop: 'var(--spacing-s)' }}
    />
  );
};

export default RegistrationNumber;
