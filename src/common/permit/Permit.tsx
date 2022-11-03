import classNames from 'classnames';
import { format } from 'date-fns';
import {
  Button,
  Card,
  IconAngleRight,
  IconCheckCircle,
  IconDocument,
} from 'hds-react';
import { orderBy } from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { removeTemporaryVehicleFromPermit } from '../../graphql/permitGqlClient';
import {
  ParkingContractType,
  Permit as PermitModel,
  PermitEditType,
  PermitEndType,
  PermitStatus,
  ROUTES,
  UserAddress,
} from '../../types';
import AddressLabel from '../addressLabel/AddressLabel';
import DeleteTemporaryVehicleDialog from '../deleteTemporaryVehicleDialog/DeleteTemporaryVehicleDialog';
import EditPermitDialog from '../editPermitDialog/EditPermitDialog';
import EndPermitDialog from '../endPermitDialog/EndPermitDialog';
import ParkingZonesMap from '../parkingZoneMap/ParkingZonesMap';
import './permit.scss';

const T_PATH = 'common.permit.Permit';

export interface Props {
  address: UserAddress;
  permits: PermitModel[];
  showActionsButtons?: boolean;
  hideMap?: boolean;
  showChangeAddressButtons?: boolean;
  fetchPermits?: () => void;
}

const Permit = ({
  permits,
  address,
  hideMap = false,
  showActionsButtons = false,
  showChangeAddressButtons = false,
  fetchPermits,
}: Props): React.ReactElement => {
  const dateFormat = 'd.M.yyyy HH:mm';
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [editPermitId, setEditPermitId] = useState<string | null>(null);
  const [deleteTmpVehiclePermitId, setDeleteTmpVehiclePermitId] = useState<
    string | null
  >(null);
  const [openEndPermitDialog, setOpenEndPermitDialog] = useState(
    permits.reduce(
      (opened: { [k: string]: boolean }, p) => ({ ...opened, [p.id]: false }),
      {}
    )
  );

  const isProcessing = (permit: PermitModel) =>
    (permit.status === PermitStatus.PAYMENT_IN_PROGRESS &&
      permit.talpaOrderId) ||
    (permit.status === PermitStatus.DRAFT && permit.isOrderConfirmed);

  const removeTemporaryVehicle = async (permitId: string) => {
    await removeTemporaryVehicleFromPermit(permitId).then(() => {
      if (fetchPermits) {
        fetchPermits();
      }
    });
  };

  const getPermit = (permit: PermitModel) => {
    const activeTempVehicle = permit.activeTemporaryVehicle;
    const { registrationNumber, manufacturer, model } = permit.vehicle;
    return (
      <div className="pp-list" key={permit.vehicle.registrationNumber}>
        {activeTempVehicle && (
          <>
            <div className="pp-list__title">
              <span
                className={classNames('pp-list__title__icon document-icon')}>
                <IconDocument className="icon" />
              </span>
              <span className="pp-list__title__text">{`${activeTempVehicle.vehicle.registrationNumber} ${activeTempVehicle.vehicle.manufacturer} ${activeTempVehicle.vehicle.model}`}</span>
            </div>
            <Button
              className="permit-actions-buttons"
              variant="supplementary"
              disabled={permits.some(isProcessing)}
              style={{ margin: 'var(--spacing-xs) 0' }}
              iconLeft={<IconAngleRight />}
              onClick={() => setDeleteTmpVehiclePermitId(permit.id)}>
              {t(`${T_PATH}.deleteTemporaryVehicle`)}
            </Button>
          </>
        )}
        {activeTempVehicle && (
          <p className="invalid-title">{t(`${T_PATH}.invalidPermit`)}</p>
        )}
        <div
          className={classNames('pp-list__title', {
            hasTemporary: activeTempVehicle,
          })}>
          <div
            className={classNames('pp-list__title__icon document-icon', {
              processing: isProcessing(permit),
            })}>
            <IconDocument className="icon" />
          </div>
          <span className="pp-list__title__text">{`${registrationNumber} ${manufacturer} ${model}`}</span>
        </div>
        {!activeTempVehicle && (
          <>
            <div className="pp-list__subtitle">
              <span>
                {format(new Date(permit.startTime as string), dateFormat)}
                {' - '}
                {permit.contractType === ParkingContractType.OPEN_ENDED &&
                  t(`${T_PATH}.contractType`)}
                {permit.contractType !== ParkingContractType.OPEN_ENDED &&
                  format(new Date(permit.endTime as string), dateFormat)}
              </span>
            </div>
          </>
        )}

        {permit.vehicle.isLowEmission && (
          <div className="message">
            <IconCheckCircle
              color={isProcessing(permit) ? '' : 'var(--color-success)'}
            />
            <div className="message-text">{t(`${T_PATH}.discount`)}</div>
          </div>
        )}
        {!hideMap && <div className="divider" />}
      </div>
    );
  };
  const canEditAddress = () => showActionsButtons && showChangeAddressButtons;
  const hasAddressChanged = (permit: PermitModel) => permit.zoneChanged;
  return (
    <div className="permit-component">
      {!hideMap && (
        <Card
          style={{
            minWidth: 'calc(50% - 72px)',
            paddingBottom: canEditAddress() ? '0' : 'var(--spacing-l)',
            background: permits.every(isProcessing)
              ? 'var(--color-black-10)'
              : 'var(--color-white)',
          }}>
          <AddressLabel address={address} />
          <ParkingZonesMap
            userAddress={address}
            zoom={13}
            zone={permits[0].parkingZone}
          />
          {showActionsButtons && showChangeAddressButtons && (
            <div className="permit-action-btns">
              <Button
                className="permit-actions-buttons"
                variant="supplementary"
                disabled={permits.some(isProcessing)}
                style={{ margin: 'var(--spacing-xs) 0' }}
                iconLeft={<IconAngleRight />}
                onClick={() => navigate(ROUTES.CHANGE_ADDRESS)}>
                {t(`${T_PATH}.changeAddress`)}
              </Button>
            </div>
          )}
        </Card>
      )}
      <div
        className={classNames('permit-card', {
          'hide-map': hideMap,
        })}>
        {orderBy(permits, 'primaryVehicle', 'desc').map((permit, index) => (
          <Card
            className={classNames({
              processing: isProcessing(permit),
              vehicleChanged: permit.vehicleChanged,
              addressChanged: permit.zoneChanged,
            })}
            key={uuidv4()}
            style={{ marginTop: index > 0 ? 'var(--spacing-xs)' : '0' }}>
            {getPermit(permit)}
            {showActionsButtons && (
              <div className="permit-action-btns">
                <Button
                  variant="supplementary"
                  disabled={
                    permits.some(isProcessing) ||
                    permits.some(hasAddressChanged)
                  }
                  onClick={() => setEditPermitId(permit.id)}
                  iconLeft={<IconAngleRight />}>
                  {t(`${T_PATH}.editVehicle`)}
                </Button>
                {permits.length > 1 && index > 0 && (
                  <Button
                    variant="supplementary"
                    disabled={!!isProcessing(permit)}
                    iconLeft={<IconAngleRight />}
                    onClick={() =>
                      setOpenEndPermitDialog({
                        ...openEndPermitDialog,
                        [permit.id]: true,
                      })
                    }>
                    {t(`${T_PATH}.removeSecondaryVehicle`)}
                  </Button>
                )}
                <EndPermitDialog
                  isOpen={openEndPermitDialog[permit.id]}
                  currentPeriodEndTime={permit.currentPeriodEndTime as string}
                  canEndAfterCurrentPeriod={permit.canEndAfterCurrentPeriod}
                  onCancel={() =>
                    setOpenEndPermitDialog({
                      ...openEndPermitDialog,
                      [permit.id]: false,
                    })
                  }
                  onConfirm={(endType: PermitEndType) =>
                    navigate({
                      pathname: ROUTES.END_PERMITS,
                      search: `?${createSearchParams({
                        permitIds: [permit.id],
                        endType,
                      })}`,
                    })
                  }
                />
              </div>
            )}
          </Card>
        ))}
      </div>
      {editPermitId && (
        <EditPermitDialog
          isOpen={!!editPermitId}
          permitId={editPermitId}
          onCancel={() => setEditPermitId(null)}
          onConfirm={(editType: PermitEditType, permitId) => {
            setEditPermitId(null);
            if (editType === PermitEditType.NEW) {
              navigate(`/temporary-vehicle/${permitId}`);
            } else {
              navigate(`/change-vehicle/${permitId}`);
            }
          }}
        />
      )}
      {deleteTmpVehiclePermitId && (
        <DeleteTemporaryVehicleDialog
          isOpen={!!deleteTmpVehiclePermitId}
          onCancel={() => setDeleteTmpVehiclePermitId(null)}
          onConfirm={() => {
            setDeleteTmpVehiclePermitId(null);
            removeTemporaryVehicle(deleteTmpVehiclePermitId);
          }}
        />
      )}
    </div>
  );
};

export default Permit;
