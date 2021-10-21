import classNames from 'classnames';
import { addMonths, format } from 'date-fns';
import {
  Button,
  Card,
  IconAngleRight,
  IconCheckCircle,
  IconDocument,
} from 'hds-react';
import { orderBy } from 'lodash';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { PermitStateContext } from '../../hooks/permitProvider';
import {
  ParkingContractType,
  Permit as PermitModel,
  PermitStatus,
  UserAddress,
  UserProfile,
} from '../../types';
import AddressLabel from '../addressLabel/AddressLabel';
import ParkingZonesMap from '../parkingZoneMap/ParkingZonesMap';
import './permit.scss';

const T_PATH = 'common.permit.Permit';

export interface Props {
  user?: UserProfile;
  address: UserAddress;
  permits: PermitModel[];
  showActionsButtons?: boolean;
  showChangeAddressButtons?: boolean;
}

const Permit = ({
  permits,
  address,
  showActionsButtons = false,
  showChangeAddressButtons = false,
}: Props): React.ReactElement => {
  const dateFormat = 'd.M.yyyy HH:mm';
  const { t } = useTranslation();
  const permitCtx = useContext(PermitStateContext);

  const getEndTime = (permit: PermitModel) =>
    permit.startTime
      ? format(
          addMonths(
            new Date(permit.startTime as string),
            permit?.monthCount || 0
          ),
          dateFormat
        )
      : '';
  const isProcessing = (permit: PermitModel) =>
    permit.status === PermitStatus.DRAFT && permit.orderId;
  const getPermit = (permit: PermitModel) => {
    const { registrationNumber, manufacturer, model } = permit.vehicle;
    return (
      <div className="pp-list" key={permit.vehicle.registrationNumber}>
        <div className="pp-list__title">
          <span
            className={classNames('pp-list__title__icon document-icon', {
              processing: isProcessing(permit),
            })}>
            <IconDocument className="icon" />
          </span>
          <span className="pp-list__title__text">{`${registrationNumber} ${manufacturer} ${model}`}</span>
        </div>
        <div className="pp-list__subtitle">
          <span>
            {format(new Date(permit.startTime as string), dateFormat)}
            {' - '}
            {permit.contractType === ParkingContractType.OPEN_ENDED &&
              t(`${T_PATH}.contractType`)}
            {permit.contractType !== ParkingContractType.OPEN_ENDED &&
              getEndTime(permit)}
          </span>
        </div>
        {permit.vehicle.isLowEmission && (
          <div className="message">
            <IconCheckCircle
              color={isProcessing(permit) ? '' : 'var(--color-success)'}
            />
            <div className="message-text">{t(`${T_PATH}.discount`)}</div>
          </div>
        )}
        <div className="divider" />
      </div>
    );
  };
  const canEditAddress = () => showActionsButtons && showChangeAddressButtons;
  return (
    <div className="permit-component">
      <Card
        style={{
          minWidth: 'calc(50% - 72px)',
          paddingBottom: canEditAddress() ? '0' : 'var(--spacing-l)',
          background: permits.every(isProcessing)
            ? 'var(--color-black-10)'
            : 'var(--color-white)',
        }}>
        <AddressLabel address={address} />
        <ParkingZonesMap userAddress={address} zoom={13} />
        {showActionsButtons && showChangeAddressButtons && (
          <div className="permit-action-btns">
            <Button
              className="permit-actions-buttons"
              variant="supplementary"
              disabled={permits.some(isProcessing)}
              style={{ margin: 'var(--spacing-xs) 0' }}
              iconLeft={<IconAngleRight />}>
              {t(`${T_PATH}.changeAddress`)}
            </Button>
          </div>
        )}
      </Card>
      <div className="permit-card">
        {orderBy(permits, 'primaryVehicle', 'desc').map((permit, index) => (
          <Card
            className={classNames({
              processing: isProcessing(permit),
            })}
            key={uuidv4()}
            style={{ marginTop: index > 0 ? 'var(--spacing-xs)' : '0' }}>
            {getPermit(permit)}
            {showActionsButtons && (
              <div className="permit-action-btns">
                <Button
                  variant="supplementary"
                  disabled={permits.some(isProcessing)}
                  iconLeft={<IconAngleRight />}>
                  {t(`${T_PATH}.editVehicle`)}
                </Button>
                {permits.length > 1 && index > 0 && (
                  <Button
                    variant="supplementary"
                    disabled={!!isProcessing(permit)}
                    iconLeft={<IconAngleRight />}
                    onClick={() => permitCtx?.deletePermit(permit.id)}>
                    {t(`${T_PATH}.removeSecondaryVehicle`)}
                  </Button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Permit;
