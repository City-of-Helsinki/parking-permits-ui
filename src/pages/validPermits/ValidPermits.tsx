import classNames from 'classnames';
import { endOfDay, format, compareAsc } from 'date-fns';
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
  const allAddresses = [primaryAddress, otherAddress];
  const addresses = allAddresses.filter(a => a !== null && a !== undefined);

  const getAddress = (): UserAddress | undefined => {
    const firstPermit = first(validPermits);
    const permitAddress = addresses.find(
      add => add.zone?.id === firstPermit?.parkingZone.id
    );
    return permitAddress || addresses.find(add => add.primary);
  };

  const address = getAddress();
  const isProcessing = (permit: PermitModel) =>
    (permit.status === PermitStatus.PAYMENT_IN_PROGRESS &&
      permit.talpaOrderId) ||
    (permit.status === PermitStatus.DRAFT && permit.isOrderConfirmed);

  const hasVehicleChanged = (permit: PermitModel) => permit.vehicleChanged;
  const hasAddressChanged = (permit: PermitModel) => permit.zoneChanged;
  const hasTemporaryVehicle = (permit: PermitModel) =>
    !!permit.activeTemporaryVehicle;

  const canEndAfterCurrentPeriod =
    first(validPermits)?.canEndAfterCurrentPeriod ?? false;

  const permitStartsInFuture = (): boolean => {
    const startTime = first(validPermits)?.startTime;
    return !!startTime && compareAsc(new Date(startTime), new Date()) > 0;
  };

  const confirmDeleteOrder = (endType: PermitEndType): void => {
    navigate({
      pathname: ROUTES.END_PERMITS,
      search: `?${createSearchParams({
        permitIds: validPermits?.map(p => p.id),
        endType,
      })}`,
    });
  };

  const deleteOrder = (): void => {
    if (!canEndAfterCurrentPeriod || permitStartsInFuture()) {
      confirmDeleteOrder(PermitEndType.IMMEDIATELY);
    } else {
      setOpenEndPermitDialog(true);
    }
  };

  return (
    <div className="valid-permit-component">
      <div className="section-label">{t(`${T_PATH}.sectionLabel`)}</div>
      {validPermits.some(
        permit =>
          permit.status === PermitStatus.PAYMENT_IN_PROGRESS &&
          permit.talpaOrderId
      ) && <PurchaseNotification validPermits={validPermits} />}

      {validPermits.some(
        permit =>
          permit.status === PermitStatus.DRAFT && permit.isOrderConfirmed
      ) && (
        <Notification
          type="alert"
          className="waitingParkkihubi"
          label={t(`${T_PATH}.waitingParkkihubi.notification.label`)}>
          {t(`${T_PATH}.waitingParkkihubi.notification.message`, {
            date: formatDate(new Date()),
            time: format(endOfDay(new Date()), 'HH:mm'),
          })}
        </Notification>
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
              validPermits.some(hasAddressChanged) ||
              validPermits.some(hasTemporaryVehicle)
            }
            iconLeft={<IconPlusCircle />}
            onClick={() => navigate(ROUTES.PERMIT_PRICES)}>
            {t(`${T_PATH}.newOrder`)}
          </Button>
        )}
        <Button
          className={classNames('action-btn hds-button-danger', {
            processing:
              validPermits.some(isProcessing) ||
              validPermits.some(hasTemporaryVehicle),
          })}
          variant="secondary"
          theme="black"
          disabled={
            validPermits.some(isProcessing) ||
            validPermits.some(hasTemporaryVehicle)
          }
          iconLeft={<IconTrash className="trash-icon" />}
          onClick={deleteOrder}>
          {t(`${T_PATH}.deleteOrder`)}
        </Button>
        <EndPermitDialog
          isOpen={openEndPermitDialog}
          currentPeriodEndTime={
            first(validPermits)?.currentPeriodEndTime as string
          }
          canEndAfterCurrentPeriod={canEndAfterCurrentPeriod}
          onCancel={() => setOpenEndPermitDialog(false)}
          onConfirm={(endType: PermitEndType) => confirmDeleteOrder(endType)}
        />
      </div>
    </div>
  );
};

export default ValidPermits;
