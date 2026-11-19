import { Card, Container } from 'hds-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { UserProfileContext } from '../../hooks/userProfileProvider';
import { ROUTES } from '../../types';
import { getLocalizedAddress } from '../../common/utils';

const T_PATH = 'pages.profilePage.ProfilePage';

const ProfilePage = (): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const profileCtx = useContext(UserProfileContext);
  if (!profileCtx?.getProfile()) {
    return <Navigate to={ROUTES.LANDING} />;
  }
  const { firstName, lastName, primaryAddress, otherAddress } =
    profileCtx.getProfile();

  const getAddresses = () =>
    [primaryAddress, otherAddress].map((address, index) => {
      const { street, city } = getLocalizedAddress(address, i18n.language);
      return (
        <div key={address.id}>
          <span
            style={{
              fontSize: 'var(--fontsize-heading-s)',
              marginTop: 'var(--spacing-s)',
            }}>
            {index === 0 ? 'Primary Address: ' : 'Other address: '}
          </span>
          <span>{`${street}, ${address.postalCode}, ${city}`}</span>
        </div>
      );
    });
  return (
    <Container>
      <div style={{ fontSize: 'var(--fontsize-heading-m)' }}>
        {t(`${T_PATH}Helsinki profile:`)}
      </div>
      <Card
        style={{ marginTop: 'var(--spacing-s)', padding: 'var(--spacing-xs)' }}>
        <div>
          <span
            style={{
              fontSize: 'var(--fontsize-heading-s)',
              marginTop: 'var(----spacing-s)',
            }}>
            Name:{' '}
          </span>
          <span>{`${firstName} ${lastName}`}</span>
        </div>
        {getAddresses()}
      </Card>
      <div style={{ fontSize: 'var(--fontsize-heading-m)' }}>Data:</div>
      <Card>
        <pre>{JSON.stringify(profileCtx?.getProfile(), null, 2)}</pre>
      </Card>
    </Container>
  );
};

export default ProfilePage;
