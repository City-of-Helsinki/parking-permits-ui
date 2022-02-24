import { Button, IconPenLine } from 'hds-react';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { UserProfile } from '../../types';
import './customerInfo.scss';

const T_PATH = 'common.customerInfo.CustomerInfo';

const CustomerInfo: FC<{ profile: UserProfile }> = ({
  profile,
}): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <div className="customer-info-component">
      <div className="title">
        <div className="header">{t(`${T_PATH}.label`)}</div>
        <Button
          variant="supplementary"
          className="edit"
          iconRight={<IconPenLine />}>
          <div style={{ borderBottom: '2px solid' }}>{t(`${T_PATH}.edit`)}</div>
        </Button>
      </div>
      <div className="info">
        <div>
          {profile?.firstName} {profile?.lastName}
        </div>
        <div>{profile?.email}</div>
        <div>{profile?.phoneNumber}</div>
      </div>
    </div>
  );
};

export default CustomerInfo;
