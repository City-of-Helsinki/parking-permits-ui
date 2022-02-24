import {
  Button,
  IconAngleLeft,
  IconArrowLeft,
  IconArrowRight,
} from 'hds-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Navigate, useNavigate } from 'react-router-dom';
import Address from '../../common/address/Address';
import { UserProfileContext } from '../../hooks/userProfileProvider';
import { ROUTES } from '../../types';

const T_PATH = 'pages.changeAddress.ChangeAddress';

const ChangeAddress = (): React.ReactElement => {
  const profileCtx = useContext(UserProfileContext);
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  if (!profileCtx?.getProfile()) {
    return <Navigate to={ROUTES.LANDING} />;
  }
  const { primaryAddress, otherAddress } = profileCtx.getProfile();
  const address = id === primaryAddress.id ? primaryAddress : otherAddress;
  return (
    <div className="change-address-component">
      <Button
        className="permit-actions-buttons"
        variant="supplementary"
        style={{ margin: 'var(--spacing-xs) 0' }}
        iconLeft={<IconAngleLeft />}
        onClick={() => navigate(ROUTES.VALID_PERMITS)}>
        {t(`${T_PATH}.back`)}
      </Button>
      <div className="section-label">{t(`${T_PATH}.title`)}</div>
      <div className="addresses">
        <Address isPrimary address={address} selectedAddress={address} />
      </div>
      <div className="action-buttons">
        <Button
          theme="black"
          className="action-btn"
          iconRight={<IconArrowRight />}
          onClick={() => navigate(ROUTES.REFUND)}>
          {t(`${T_PATH}.actionBtn.continue`)}
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          iconLeft={<IconArrowLeft />}
          onClick={() => navigate(ROUTES.VALID_PERMITS)}>
          {t(`${T_PATH}.actionBtn.cancel`)}
        </Button>
      </div>
    </div>
  );
};

export default ChangeAddress;
