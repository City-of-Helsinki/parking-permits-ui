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
import { dateAsNumber } from '../../utils';

const T_PATH = 'common.permit.Permit';

export interface Props {
  address: UserAddress;
  permits: PermitModel[];
  showActionsButtons?: boolean;
  hideMap?: boolean;
  showChangeAddressButtons?: boolean;

  fetchPermits?: () => void;
}

type PermitTimes = { startTime: Date; endTime: Date };

const Permit = ({
  permits,
  address,
  hideMap = false,
  showActionsButtons = false,
  showChangeAddressButtons = false,

  fetchPermits,
}: Props): React.ReactElement => {
  const dateFormat = 'd.M.yyyy HH:mm';
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
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
  const hasTemporaryVehicle = (permit: PermitModel) =>
    permit.activeTemporaryVehicle;

  const removeTemporaryVehicle = async (permitId: string) => {
    await removeTemporaryVehicleFromPermit(permitId).then(() => {
      if (fetchPermits) {
        fetchPermits();
      }
    });
  };

  const getPermitTimes = (permit: PermitModel): Array<PermitTimes> => {
    const {
      startTime,
      endTime,
      currentPeriodEndTime,
      contractType,
      activeTemporaryVehicle,
    } = permit;

    const permitStartTime = startTime ? new Date(startTime) : null;

    let permitEndTime = endTime ? new Date(endTime) : null;

    if (
      !permitEndTime &&
      contractType === ParkingContractType.OPEN_ENDED &&
      !!currentPeriodEndTime
    ) {
      permitEndTime = new Date(currentPeriodEndTime);
    }

    if (!permitStartTime || !permitEndTime) {
      return [];
    }

    if (
      !activeTemporaryVehicle?.startTime ||
      !activeTemporaryVehicle?.endTime
    ) {
      return [{ startTime: permitStartTime, endTime: permitEndTime }];
    }
    const tempStartTime = new Date(activeTemporaryVehicle.startTime);
    const tempEndTime = new Date(activeTemporaryVehicle.endTime);

    if (tempStartTime > permitEndTime || tempEndTime < permitStartTime) {
      return [{ startTime: permitStartTime, endTime: permitEndTime }];
    }

    const permitTimes = [
      { startTime: permitStartTime, endTime: tempStartTime },
    ];

    if (permitEndTime > tempEndTime) {
      permitTimes.push({ startTime: tempEndTime, endTime: permitEndTime });
    }

    return permitTimes;
  };

  const getContractType = (permit: PermitModel): string => {
    const { contractType } = permit;

    if (contractType === ParkingContractType.OPEN_ENDED) {
      return ` ${t(`${T_PATH}.contractTypeOpenEnded`)}`;
    }

    if (contractType === ParkingContractType.FIXED_PERIOD) {
      return `  ${t(`${T_PATH}.contractTypeFixedPeriod`)}`;
    }

    return '';
  };

  const getPermit = (permit: PermitModel) => {
    const activeTempVehicle = permit.activeTemporaryVehicle;
    const { registrationNumber, manufacturer, model } = permit.vehicle;
    const permitTimes = getPermitTimes(permit);
    const contractType = getContractType(permit);
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
            <div className="pp-list__subtitle">
              <span>
                {format(
                  new Date(activeTempVehicle.startTime as string),
                  dateFormat
                )}
                {' - '}
                {format(
                  new Date(activeTempVehicle.endTime as string),
                  dateFormat
                )}
              </span>
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
            hasTemporary: true,
          })}>
          <div
            className={classNames('pp-list__title__icon document-icon', {
              processing: isProcessing(permit),
            })}>
            <IconDocument className="icon" />
          </div>
          <div className="pp-list__title__text">
            {`${registrationNumber} ${manufacturer} ${model}`}
            <div className="pp-list__title__vehicle-copyright">
              {t(`${T_PATH}.vehicleCopyright`)}
            </div>
          </div>
        </div>

        {permitTimes.map(({ startTime, endTime }) => (
          <div className="pp-list__subtitle" key={startTime.toUTCString()}>
            <span>
              {format(startTime, dateFormat)}
              {' - '}
              {format(endTime, dateFormat)}
              {contractType}
            </span>
          </div>
        ))}

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

  const bothPermitWithSameContractType =
    permits.every(p => p.contractType === ParkingContractType.OPEN_ENDED) ||
    permits.every(p => p.contractType === ParkingContractType.FIXED_PERIOD);

  const isAllPermitStarted = permits.every(
    p => p.startTime && dateAsNumber(p.startTime) < new Date().valueOf()
  );

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
          <AddressLabel
            address={address}
            addressApartment={
              lang === 'sv'
                ? permits[0].addressApartmentSv
                : permits[0].addressApartment
            }
          />
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
                disabled={
                  permits.some(isProcessing) ||
                  permits.some(hasTemporaryVehicle) ||
                  !bothPermitWithSameContractType ||
                  !isAllPermitStarted
                }
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
                {!permits.some(hasTemporaryVehicle) && (
                  <Button
                    variant="supplementary"
                    disabled={
                      permits.some(isProcessing) ||
                      permits.some(hasAddressChanged) ||
                      !isAllPermitStarted
                    }
                    onClick={() => setEditPermitId(permit.id)}
                    iconLeft={<IconAngleRight />}>
                    {t(`${T_PATH}.editVehicle`)}
                  </Button>
                )}
                {permit.canExtendPermit && (
                  <Button
                    variant="supplementary"
                    iconLeft={<IconAngleRight />}
                    onClick={() => navigate(`/extend-permit/${permit.id}`)}>
                    {t(`${T_PATH}.extendPermit`)}
                  </Button>
                )}
                {permits.length > 1 && index > 0 && (
                  <Button
                    variant="supplementary"
                    disabled={
                      !!isProcessing(permit) ||
                      permits.some(hasTemporaryVehicle)
                    }
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
