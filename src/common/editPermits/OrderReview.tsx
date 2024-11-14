import { Button, IconSignout, Notification } from 'hds-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ClientContext } from '../../client/ClientProvider';
import {
  Permit as PermitType,
  ROUTES,
  UserAddress,
  UserProfile,
} from '../../types';
import Permit from '../permit/Permit';
import './OrderReview.scss';

const T_PATH = 'common.editPermits.OrderReview';

interface OrderReviewProps {
  className?: string;
  address: UserAddress;
  profile: UserProfile;
  validPermits: PermitType[];
  hasRefundCreated?: boolean;
}

const OrderReview: React.FC<OrderReviewProps> = ({
  className,
  address,
  profile,
  validPermits,
  hasRefundCreated,
}: OrderReviewProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clientCtx = useContext(ClientContext);
  return (
    <div className={className}>
      <div className="review-detail">
        <Notification
          className="notification"
          type="info"
          label={t(`${T_PATH}.notification.info.orderSuccessTitle`)}>
          {t(`${T_PATH}.notification.info.orderSuccessMessage`)}
        </Notification>
        {hasRefundCreated && (
          <Notification
            className="notification"
            type="info"
            label={t(`${T_PATH}.notification.info.pendingRefundTitle`)}>
            {t(`${T_PATH}.notification.error.pendingRefundMessage`, {
              email: profile.email,
            })}
          </Notification>
        )}
        <div className="title">
          {t(`${T_PATH}.title`)}, {profile.firstName}
        </div>
        <Permit
          address={address}
          permits={validPermits}
          showActionsButtons={false}
          showChangeAddressButtons={false}
        />
      </div>
      <div className="action-buttons">
        <Button
          type="submit"
          className="action-btn"
          onClick={() => navigate(ROUTES.VALID_PERMITS)}
          theme="black">
          <span>{t(`${T_PATH}.actionBtn.returnToHomePage`)}</span>
        </Button>
        <Button
          className="action-btn"
          variant="secondary"
          iconLeft={<IconSignout />}
          onClick={() => clientCtx?.client.logout()}
          theme="black">
          <span>{t(`${T_PATH}.actionBtn.logout`)}</span>
        </Button>
      </div>
    </div>
  );
};

export default OrderReview;
