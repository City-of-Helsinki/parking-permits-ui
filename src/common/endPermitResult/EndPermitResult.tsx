import { Button, IconSignout, Notification } from 'hds-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ClientContext } from '../../client/ClientProvider';
import { ROUTES } from '../../types';

const T_PATH = 'common.endPermitResult.EndPermitResult';

export interface Props {
  getsRefund: boolean;
  email: string;
}

const EndPermitResult = ({ getsRefund, email }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const clientCtx = useContext(ClientContext);
  const navigate = useNavigate();

  return (
    <div className="end-permit-result-component">
      <Notification
        type="success"
        style={{
          marginTop: 'var(--spacing-s)',
          marginBottom: 'var(--spacing-s)',
        }}>
        {t(`${T_PATH}.notification.first.message`)}
      </Notification>
      {getsRefund && (
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
          theme="black"
          variant="secondary"
          onClick={(): void => clientCtx?.client.logout()}>
          <IconSignout />
          <span>{t(`${T_PATH}.actionBtn.logout`)}</span>
        </Button>
        <Button
          className="action-btn"
          theme="black"
          onClick={() => navigate(ROUTES.VALID_PERMITS)}>
          <span>{t(`${T_PATH}.actionBtn.confirmationMsg`)}</span>
        </Button>
      </div>
    </div>
  );
};

export default EndPermitResult;
