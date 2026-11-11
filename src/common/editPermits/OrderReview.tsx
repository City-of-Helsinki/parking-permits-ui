import {
  Button,
  ButtonPresetTheme,
  ButtonVariant,
  IconSignout,
  Notification,
  useOidcClient,
} from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
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
  const { logout } = useOidcClient();
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
          showAddressTypeLabel={false}
        />
      </div>
      <div className="action-buttons">
        <Button
          type="submit"
          className="action-btn"
          onClick={() => navigate(ROUTES.VALID_PERMITS)}
          theme={ButtonPresetTheme.Black}>
          {t(`${T_PATH}.actionBtn.returnToHomePage`)}
        </Button>
        <Button
          className="action-btn"
          variant={ButtonVariant.Secondary}
          iconStart={<IconSignout />}
          onClick={() => logout()}
          theme={ButtonPresetTheme.Black}>
          {t(`${T_PATH}.actionBtn.logout`)}
        </Button>
      </div>
    </div>
  );
};

export default OrderReview;
