import { Button, LoadingSpinner, TextInput } from 'hds-react';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { PermitStateContext } from '../../hooks/permitProvider';
import './registrationNumber.scss';

const T_PATH = 'common.registrationNumber.RegistrationNumber';

const RegistrationNumber = (): React.ReactElement => {
  const permitCtx = useContext(PermitStateContext);
  const { t } = useTranslation();
  const [checkReg, setCheckReg] = useState(false);
  const [tempRegistration, setTempRegistration] = useState('');

  const inputRegistration = (event: { target: { value: string } }) => {
    const { value } = event.target;
    setTempRegistration(value);
  };

  if (permitCtx?.getStatus() === 'loaded' && checkReg) {
    setTempRegistration('');
    setCheckReg(false);
  }

  const createPermit = () => {
    if (tempRegistration && permitCtx) {
      permitCtx?.createPermit(tempRegistration);
      setCheckReg(true);
    }
  };
  return (
    <div className="registration-number-container">
      <TextInput
        id={uuidv4()}
        maxLength={7}
        disabled={(permitCtx?.getPermits().length || 0) >= 2}
        value={tempRegistration}
        label={t(`${T_PATH}.label`)}
        onChange={inputRegistration}
        className="registration-input"
        helperText={t(`${T_PATH}.helpText`)}
      />
      <Button
        variant="secondary"
        className="action-btn"
        onClick={createPermit}
        disabled={(permitCtx?.getPermits().length || 0) >= 2}>
        {permitCtx?.getStatus() !== 'loading' && t(`${T_PATH}.btn`)}
        {permitCtx?.getStatus() === 'loading' && <LoadingSpinner small />}
      </Button>
    </div>
  );
};

export default RegistrationNumber;
