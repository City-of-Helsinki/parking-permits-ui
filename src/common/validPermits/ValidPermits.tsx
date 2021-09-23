import { Button, IconPlusCircle, IconTrash } from 'hds-react';
import { first } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import {
  Permit as PermitModel,
  PermitStatus,
  STEPPER,
  UserAddress,
  UserProfile,
} from '../../redux';
import {
  deletePermit,
  setCurrentStepper,
} from '../../redux/actions/permitCart';
import Permit from '../permit/Permit';
import './validPermits.scss';

const T_PATH = 'common.validPermit';

export interface Props {
  user: UserProfile;
  addresses: UserAddress[];
  permits: PermitModel[];
}

const ValidPermits = ({
  addresses,
  permits,
  user,
}: Props): React.ReactElement => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const getAddress = (): UserAddress | undefined => {
    const firstPermit = first(Object.values(permits || []));
    return addresses.find(add => add.zone?.id === firstPermit?.parkingZone.id);
  };
  const address = getAddress();
  const paidPermits = Object.values(permits || []).filter(
    permit => permit.status === PermitStatus.VALID
  );
  const deletePermits = () => {
    permits.map(permit => dispatch(deletePermit(user, permit.id)));
    dispatch(setCurrentStepper(STEPPER.ADDRESS_SELECTOR));
  };
  return (
    <div className="valid-permit-component">
      <div className="section-label">{t(`${T_PATH}.sectionLabel`)}</div>
      {address && paidPermits.length > 0 && address.zone && (
        <Permit
          user={user}
          address={address}
          permits={paidPermits}
          showActionsButtons
          showChangeAddressButtons={addresses.length > 1}
        />
      )}
      <div className="action-buttons">
        {paidPermits.length === 1 && (
          <Button
            className="action-btn"
            variant="secondary"
            theme="black"
            iconLeft={<IconPlusCircle />}
            onClick={() =>
              dispatch(setCurrentStepper(STEPPER.ADDRESS_SELECTOR))
            }>
            {t(`${T_PATH}.newOrder`)}
          </Button>
        )}
        <Button
          className="action-btn hds-button-danger"
          variant="secondary"
          theme="black"
          iconLeft={<IconTrash className="trash-icon" />}
          onClick={() => deletePermits()}>
          {t(`${T_PATH}.deleteOrder`)}
        </Button>
      </div>
    </div>
  );
};

export default ValidPermits;
