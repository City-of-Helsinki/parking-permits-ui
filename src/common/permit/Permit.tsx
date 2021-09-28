import { addMonths, format } from 'date-fns';
import {
  Button,
  Card,
  IconAngleRight,
  IconCheckCircle,
  IconDocument,
} from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  ParkingContractType,
  Permit as PermitModel,
  UserAddress,
  UserProfile,
} from '../../redux';
import { deletePermit } from '../../redux/actions/permitCart';
import AddressLabel from '../addressLabel/AddressLabel';
import ParkingZonesMap from '../addressSelector/parkingZoneMap/ParkingZonesMap';
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
  user,
  permits,
  address,
  showActionsButtons = false,
  showChangeAddressButtons = false,
}: Props): React.ReactElement => {
  const dateFormat = 'd.M.yyyy HH:mm';
  const { t } = useTranslation();
  const dispatch = useDispatch();

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

  const getPermit = (permit: PermitModel) => {
    const { registrationNumber, manufacturer, model } = permit.vehicle;
    return (
      <div className="pp-list" key={permit.vehicle.registrationNumber}>
        <div className="pp-list__title">
          <span className="pp-list__title__icon document-icon">
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
            <IconCheckCircle color="var(--color-success)" />
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
        }}>
        <AddressLabel address={address} />
        <ParkingZonesMap userAddress={address} zoom={13} />
        {showActionsButtons && showChangeAddressButtons && (
          <div className="permit-action-btns">
            <Button
              className="permit-actions-buttons"
              variant="supplementary"
              style={{ margin: 'var(--spacing-xs) 0' }}
              iconLeft={<IconAngleRight />}>
              {t(`${T_PATH}.changeAddress`)}
            </Button>
          </div>
        )}
      </Card>
      <div className="permit-card">
        {permits.map((permit, index) => (
          <Card
            key={uuidv4()}
            style={{ marginTop: index > 0 ? 'var(--spacing-xs)' : '0' }}>
            {getPermit(permit)}
            {showActionsButtons && (
              <div className="permit-action-btns">
                <Button variant="supplementary" iconLeft={<IconAngleRight />}>
                  {t(`${T_PATH}.editVehicle`)}
                </Button>
                {permits.length > 1 && index > 0 && (
                  <Button
                    variant="supplementary"
                    iconLeft={<IconAngleRight />}
                    onClick={() =>
                      dispatch(deletePermit(user as UserProfile, permit.id))
                    }>
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
