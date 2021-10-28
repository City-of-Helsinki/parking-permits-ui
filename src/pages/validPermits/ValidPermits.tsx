import classNames from 'classnames';
import { Button, IconPlusCircle, IconTrash } from 'hds-react';
import { first } from 'lodash';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import Permit from '../../common/permit/Permit';
import PurchaseNotification from '../../common/purchaseNotification/PurchaseNotification';
import { PermitStateContext } from '../../hooks/permitProvider';
import { UserProfileContext } from '../../hooks/userProfileProvider';
import {
  Permit as PermitModel,
  PermitStatus,
  ROUTES,
  UserAddress,
} from '../../types';
import './validPermits.scss';

const T_PATH = 'pages.validPermit.ValidPermit';

const ValidPermits = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profileCtx = useContext(UserProfileContext);
  const permitCtx = useContext(PermitStateContext);

  const profile = profileCtx?.getProfile();
  const validPermits = permitCtx?.getValidPermits();

  if (!profile || !validPermits?.length) {
    return <Navigate to={ROUTES.BASE} />;
  }

  const { primaryAddress, otherAddress } = profile;
  const addresses = [primaryAddress, otherAddress];

  const getAddress = (): UserAddress | undefined => {
    const firstPermit = first(validPermits);
    return addresses.find(add => add.zone?.id === firstPermit?.parkingZone.id);
  };

  const address = getAddress();
  const deletePermits = () => {
    validPermits.map(permit => permitCtx?.deletePermit(permit.id));
    navigate(ROUTES.ADDRESS);
  };
  const isProcessing = (permit: PermitModel) =>
    permit.status === PermitStatus.PROCESSING && permit.orderId;

  return (
    <div className="valid-permit-component">
      <div className="section-label">{t(`${T_PATH}.sectionLabel`)}</div>
      {validPermits.some(isProcessing) && (
        <PurchaseNotification validPermits={validPermits} />
      )}
      {address && validPermits.length > 0 && address.zone && (
        <Permit
          user={profile}
          address={address}
          permits={validPermits}
          showActionsButtons
          showChangeAddressButtons={addresses.length > 1}
        />
      )}
      <div className="action-buttons">
        {validPermits.length === 1 && (
          <Button
            className="action-btn"
            variant="secondary"
            theme="black"
            disabled={validPermits.some(isProcessing)}
            iconLeft={<IconPlusCircle />}
            onClick={() => navigate(ROUTES.CAR_REGISTRATIONS)}>
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
          onClick={() => deletePermits()}>
          {t(`${T_PATH}.deleteOrder`)}
        </Button>
      </div>
    </div>
  );
};

export default ValidPermits;
