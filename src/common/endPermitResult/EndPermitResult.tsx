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
import { PermitEndType, ROUTES } from '../../types';

const T_PATH = 'common.endPermitResult.EndPermitResult';

export interface Props {
  displayRefundNotification: boolean;
  email: string;
  endType?: PermitEndType;
}

const EndPermitResult = ({
  displayRefundNotification,
  email,
  endType,
}: Props): React.ReactElement => {
  const { t } = useTranslation();
  const { logout } = useOidcClient();
  const navigate = useNavigate();

  return (
    <div className="end-permit-result-component">
      <Notification
        type="success"
        style={{
          marginTop: 'var(--spacing-s)',
          marginBottom: 'var(--spacing-s)',
        }}>
        <div>{t(`${T_PATH}.notification.first.message`)}</div>
        {endType && (
          <div>
            {t(
              `${T_PATH}.notification.first.${
                endType === PermitEndType.AFTER_CURRENT_PERIOD
                  ? 'afterCurrentPeriod'
                  : 'immediately'
              }`
            )}
          </div>
        )}
      </Notification>
      {displayRefundNotification && (
        <Notification
          type="success"
          style={{
            marginTop: 'var(--spacing-l)',
            marginBottom: 'var(--spacing-l)',
          }}
          label={t(`${T_PATH}.notification.second.label`)}>
          {t(`${T_PATH}.notification.second.message`, { email })}
        </Notification>
      )}

      <div className="action-buttons">
        <Button
          className="action-btn"
          theme={ButtonPresetTheme.Black}
          variant={ButtonVariant.Secondary}
          iconStart={<IconSignout />}
          onClick={() => logout()}>
          {t(`${T_PATH}.actionBtn.logout`)}
        </Button>
        <Button
          className="action-btn"
          theme={ButtonPresetTheme.Black}
          onClick={() => navigate(ROUTES.VALID_PERMITS)}>
          {t(`${T_PATH}.actionBtn.confirmationMsg`)}
        </Button>
      </div>
    </div>
  );
};

export default EndPermitResult;
