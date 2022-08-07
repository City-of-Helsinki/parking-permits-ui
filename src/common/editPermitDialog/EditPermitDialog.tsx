import { Button, Dialog, RadioButton } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PermitEditType } from '../../types';
import './editPermitDialog.scss';

const T_PATH = 'common.editPermitDialog.EditPermitDialog';

interface EndPermitDialogProps {
  isOpen: boolean;
  permitId: string;
  onCancel: () => void;
  onConfirm: (endType: PermitEditType, permitId: string) => void;
}

const EditPermitDialog = ({
  isOpen,
  permitId,
  onCancel,
  onConfirm,
}: EndPermitDialogProps): React.ReactElement => {
  const { t } = useTranslation();
  const [endType, setEndType] = useState<PermitEditType | undefined>();
  return (
    <Dialog
      id="edit-permit-dialog"
      aria-labelledby="confirmEditPermit"
      isOpen={isOpen}>
      <Dialog.Header id="confirmEditPermit" title={t(`${T_PATH}.title`)} />
      <Dialog.Content>
        <RadioButton
          id="temporary-vehicle-permit"
          name="temporaryVehicle"
          className="temporary-vehicle-permit"
          label={t(`${T_PATH}.newVehicle`)}
          value={PermitEditType.TEMPORARY}
          checked={endType === PermitEditType.TEMPORARY}
          onChange={e => setEndType(e.target.value as PermitEditType)}
        />
        <RadioButton
          id="new-vehicle-permit"
          name="newVehicle"
          className="new-vehicle-permit"
          label={t(`${T_PATH}.temporaryVehicle`)}
          value={PermitEditType.NEW}
          checked={endType === PermitEditType.NEW}
          onChange={e => setEndType(e.target.value as PermitEditType)}
        />
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button
          theme="black"
          disabled={!endType}
          onClick={() => endType && onConfirm(endType, permitId)}>
          {t(`${T_PATH}.actionBtn.continue`)}
        </Button>
        <Button theme="black" variant="secondary" onClick={() => onCancel()}>
          {t(`${T_PATH}.actionBtn.cancel`)}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};
export default EditPermitDialog;
