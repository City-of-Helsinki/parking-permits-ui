import { Button, ButtonPresetTheme, ButtonVariant, Dialog } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import './deleteTemporaryVehicleDialog.scss';

const T_PATH =
  'common.deleteTemporaryVehicleDialog.DeleteTemporaryVehicleDialog';

interface EndPermitDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteTemporaryVehicleDialog = ({
  isOpen,
  onCancel,
  onConfirm: handleConfirm,
}: EndPermitDialogProps): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <Dialog
      id="delete-temporary-vehicle-dialog"
      aria-labelledby="deleteTemporaryVehicleDialog"
      isOpen={isOpen}>
      <Dialog.Header
        id="deleteTemporaryVehicleDialog"
        title={t(`${T_PATH}.title`)}
      />
      <Dialog.Content>{t(`${T_PATH}.message`)}</Dialog.Content>
      <Dialog.ActionButtons>
        <Button theme={ButtonPresetTheme.Black} onClick={handleConfirm}>
          {t(`${T_PATH}.actionBtn.continue`)}
        </Button>
        <Button
          theme={ButtonPresetTheme.Black}
          variant={ButtonVariant.Secondary}
          onClick={() => onCancel()}>
          {t(`${T_PATH}.actionBtn.cancel`)}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};
export default DeleteTemporaryVehicleDialog;
