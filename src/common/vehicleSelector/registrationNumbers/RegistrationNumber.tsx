import { TextInput } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { updateRegistration } from '../../../redux/actions/permitCart';
import Validate from './validate';

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
      dispatch(updateRegistration(reg, index));
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
