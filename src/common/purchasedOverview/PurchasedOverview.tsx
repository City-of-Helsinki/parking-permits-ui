import { Button, IconDocument, IconSignout, Notification } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useClient } from '../../client/hooks';
import { Permit as PermitModel, STEPPER, UserAddress } from '../../redux';
import { setCurrentStepper } from '../../redux/actions/permitCart';
import Permit from '../permit/Permit';
import './purchasedOverview.scss';

const T_PATH = 'common.purchasedOverview.PurchasedOverview';

export interface Props {
  address: UserAddress;
  permits: PermitModel[];
}

const PurchasedOverview = ({ address, permits }: Props): React.ReactElement => {
  const client = useClient();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  return (
    <div className="purchased-overview-component">
      <Notification
        type="success"
        className="notification"
        label={t(`${T_PATH}.notification.success.label`)}>
        {t(`${T_PATH}.notification.success.message`)}
      </Notification>
      <Button theme="black" variant="secondary" className="download-receipt">
        <IconDocument />
        <span>{t(`${T_PATH}.btn.receipt`)}</span>
      </Button>
      <Permit address={address} permits={permits} />
      <div className="action-buttons">
        <Button
          className="action-btn"
          theme="black"
          onClick={() => dispatch(setCurrentStepper(STEPPER.VALID_PERMITS))}>
          <span>{t(`${T_PATH}.actionBtn.frontPage`)}</span>
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          onClick={(): void => client.logout()}>
          <IconSignout />
          <span>{t(`${T_PATH}.actionBtn.logout`)}</span>
        </Button>
      </div>
    </div>
  );
};

export default PurchasedOverview;
