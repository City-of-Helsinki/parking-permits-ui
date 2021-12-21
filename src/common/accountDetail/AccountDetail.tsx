import {
  Button,
  Card,
  IconArrowRight,
  IconInfoCircle,
  IconLinkExternal,
  Link,
  TextInput,
} from 'hds-react';
import { electronicFormatIBAN, isValidIBAN } from 'ibantools';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { EndPermitStep, Permit, PermitEndType } from '../../types';

const T_PATH = 'common.accountDetail.AccountDetail';

interface Props {
  permits: Permit[];
  endType: PermitEndType;
  endValidPermits: (
    permitIds: string[],
    endType: string,
    iban: string
  ) => Promise<void>;
  setEndPermitState: (state: EndPermitStep) => void;
}

const AccountDetail = ({
  permits,
  endType,
  setEndPermitState,
  endValidPermits,
}: Props): React.ReactElement => {
  const { t } = useTranslation();
  const [iban, setIban] = useState('');
  const [valid, setValid] = useState(false);
  const [dirty, setDirty] = useState(false);

  const inputIban = (event: { target: { value: string } }) => {
    const { value } = event.target;

    const isValid = isValidIBAN(electronicFormatIBAN(value) || '');
    setValid(isValid);
    setDirty(true);
    setIban(value);
  };

  const onEnd = async () => {
    await endValidPermits(
      permits.map(p => p.id),
      endType,
      iban
    );
    setEndPermitState(EndPermitStep.RESULT);
  };

  return (
    <div className="accountDetail-component">
      <Card>
        <div style={{ fontSize: 'var(--fontsize-body-xl)' }}>
          {t(`${T_PATH}.label`)}
        </div>
        <p>{t(`${T_PATH}.message`)}</p>
        <TextInput
          id={uuidv4()}
          maxLength={40}
          value={iban}
          errorText={!valid && dirty ? t(`${T_PATH}.errorText`) : ''}
          label={t(`${T_PATH}.accountLabel`)}
          onChange={inputIban}
          onBlur={inputIban}
          required
        />
        <div
          style={{
            margin: 'var(--spacing-xs) 0',
            display: 'flex',
          }}>
          <IconInfoCircle />
          <div style={{ marginLeft: 'var(--spacing-xs)' }}>
            {t(`${T_PATH}.nonFinnInfo`)}
          </div>
        </div>
        <Link
          style={{ marginLeft: 'var(--spacing-l)' }}
          openInNewTab
          href={t(`${T_PATH}.service.link`)}
          iconLeft={<IconLinkExternal size="xs" />}>
          {t(`${T_PATH}.service.linkText`)}
        </Link>
      </Card>
      <div className="action-buttons">
        <Button
          theme="black"
          className="action-btn"
          disabled={!valid}
          onClick={() => onEnd()}>
          <span>{t(`${T_PATH}.actionBtn.continue`)}</span>
          <IconArrowRight />
        </Button>
      </div>
    </div>
  );
};

export default AccountDetail;
