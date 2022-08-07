import classNames from 'classnames';
import { endOfDay, format } from 'date-fns';
import { Button, IconPlusCircle, IconTrash, Notification } from 'hds-react';
import { first } from 'lodash';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createSearchParams, Navigate, useNavigate } from 'react-router-dom';
import EndPermitDialog from '../../common/endPermitDialog/EndPermitDialog';
import Permit from '../../common/permit/Permit';
import PurchaseNotification from '../../common/purchaseNotification/PurchaseNotification';
import { PermitStateContext } from '../../hooks/permitProvider';
import { UserProfileContext } from '../../hooks/userProfileProvider';
import {
  Permit as PermitModel,
  PermitEndType,
  PermitStatus,
  ROUTES,
  UserAddress,
} from '../../types';
import { formatDate } from '../../utils';
import './validPermits.scss';

const T_PATH = 'pages.validPermit.ValidPermit';

const ValidPermits = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profileCtx = useContext(UserProfileContext);
  const permitCtx = useContext(PermitStateContext);
  const [openEndPermitDialog, setOpenEndPermitDialog] = useState(false);

  const profile = profileCtx?.getProfile();
  const validPermits = permitCtx?.getValidPermits();

  if (!profile || !validPermits?.length) {
    return <Navigate to={ROUTES.BASE} />;
  }

  const { primaryAddress, otherAddress } = profile;
  const addresses = [primaryAddress, otherAddress];

  const getAddress = (): UserAddress | undefined => {
    const firstPermit = first(validPermits);
    const permitAddress = addresses.find(
      add => add.zone?.id === firstPermit?.parkingZone.id
    );
    return permitAddress || addresses.find(add => add.primary);
  };

  const address = getAddress();
  const isProcessing = (permit: PermitModel) =>
    permit.status === PermitStatus.PAYMENT_IN_PROGRESS && permit.talpaOrderId;

  const hasVehicleChanged = (permit: PermitModel) => permit.vehicleChanged;
  const hasAddressChanged = (permit: PermitModel) => permit.zoneChanged;

  return (
    <div className="valid-permit-component">
      <div className="section-label">{t(`${T_PATH}.sectionLabel`)}</div>
      {validPermits.some(isProcessing) && (
        <PurchaseNotification validPermits={validPermits} />
      )}
      {validPermits.some(hasVehicleChanged) && (
        <Notification
          type="alert"
          className="vehicleChanged"
          label={t(`${T_PATH}.vehicleChanged.notification.label`)}>
          {t(`${T_PATH}.vehicleChanged.notification.message`, {
            date: formatDate(new Date()),
            time: format(endOfDay(new Date()), 'HH:mm'),
          })}
        </Notification>
      )}
      {validPermits.some(hasAddressChanged) && (
        <Notification
          type="alert"
          className="addressChanged"
          label={t(`${T_PATH}.addressChanged.notification.label`)}>
          {t(`${T_PATH}.addressChanged.notification.message`, {
            date: formatDate(new Date()),
            time: format(endOfDay(new Date()), 'HH:mm'),
          })}
        </Notification>
      )}
      {address && validPermits.length > 0 && (
        <Permit
          address={address}
          permits={validPermits}
          showActionsButtons
          showChangeAddressButtons={addresses.length > 1}
          fetchPermits={permitCtx?.fetchPermits}
        />
      )}
      <div className="action-buttons">
        {validPermits.length === 1 && (
          <Button
            className="action-btn"
            variant="secondary"
            theme="black"
            disabled={
              validPermits.some(isProcessing) ||
              validPermits.some(hasAddressChanged)
            }
            iconLeft={<IconPlusCircle />}
            onClick={() => navigate(ROUTES.PERMIT_PRICES)}>
            {t(`${T_PATH}.newOrder`)}
          </Button>
        )}
        <Button
          className={classNames('action-btn hds-button-danger', {
            processing: validPermits.some(isProcessing),
          })}
          variant="secondary"
          theme="black"
          disabled={validPermits.some(isProcessing)}
          iconLeft={<IconTrash className="trash-icon" />}
          onClick={() => setOpenEndPermitDialog(true)}>
          {t(`${T_PATH}.deleteOrder`)}
        </Button>
        <EndPermitDialog
          isOpen={openEndPermitDialog}
          currentPeriodEndTime={
            first(validPermits)?.currentPeriodEndTime as string
          }
          canEndAfterCurrentPeriod={
            first(validPermits)?.canEndAfterCurrentPeriod || false
          }
          onCancel={() => setOpenEndPermitDialog(false)}
          onConfirm={(endType: PermitEndType) =>
            navigate({
              pathname: ROUTES.END_PERMITS,
              search: `?${createSearchParams({
                permitIds: validPermits?.map(p => p.id),
                endType,
              })}`,
            })
          }
        />
      </div>
    </div>
  );
};

export default ValidPermits;
