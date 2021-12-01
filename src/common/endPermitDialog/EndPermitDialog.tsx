import { Button, Dialog, RadioButton } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PermitEndType } from '../../types';
import { formatDateTimeDisplay } from '../../utils';
import './endPermitDialog.scss';

const T_PATH = 'common.endPermitDialog.EndPermitDialog';

interface EndPermitDialogProps {
  isOpen: boolean;
  canEndAfterCurrentPeriod: boolean;
  currentPeriodEndTime: string;
  onCancel: () => void;
  onConfirm: (endType: PermitEndType) => void;
}

const EndPermitDialog = ({
  isOpen,
  canEndAfterCurrentPeriod,
  currentPeriodEndTime,
  onCancel,
  onConfirm,
}: EndPermitDialogProps): React.ReactElement => {
  const { t } = useTranslation();
  const [endType, setEndType] = useState<PermitEndType | undefined>();
  return (
    <Dialog
      id="confirm-end-permit"
      aria-labelledby="confirmEndPermit"
      isOpen={isOpen}>
      <Dialog.Header id="confirmEndPermit" title={t(`${T_PATH}.title`)} />
      <Dialog.Content>
        <div className="chooseEndTypeLabel">
          {t(`${T_PATH}.choosePermitEndType`)}
        </div>
        <RadioButton
          id="endImmediately"
          name="endType"
          label={t(`${T_PATH}.endImmediately`)}
          value={PermitEndType.IMMEDIATELY}
          checked={endType === PermitEndType.IMMEDIATELY}
          onChange={e => setEndType(e.target.value as PermitEndType)}
        />
        <RadioButton
          id="endAfterCurrentPeriod"
          name="endType"
          disabled={!canEndAfterCurrentPeriod}
          label={t(`${T_PATH}.endAfterCurrentPeriod`)}
          value={PermitEndType.AFTER_CURRENT_PERIOD}
          checked={endType === PermitEndType.AFTER_CURRENT_PERIOD}
          onChange={e => setEndType(e.target.value as PermitEndType)}
        />
        <div className="currentPeriodEndTime">
          {formatDateTimeDisplay(currentPeriodEndTime)}
        </div>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button
          theme="black"
          disabled={!endType}
          onClick={() => endType && onConfirm(endType)}>
          {t(`${T_PATH}.continue`)}
        </Button>
        <Button theme="black" variant="secondary" onClick={() => onCancel()}>
          {t(`${T_PATH}.cancel`)}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};
export default EndPermitDialog;
