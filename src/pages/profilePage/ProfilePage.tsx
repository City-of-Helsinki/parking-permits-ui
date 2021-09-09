import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Card, Container } from 'reactstrap';
import { ApiAccessTokenActions } from '../../client/types';
import { ApiAccessTokenContext } from '../../common/apiAccessTokenProvider';
import { StoreState } from '../../redux';

const T_PATH = 'pages.profilePage.ProfilePage';

const ProfilePage = (): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const actions = useContext(ApiAccessTokenContext) as ApiAccessTokenActions;
  const { helsinkiProfileState } = useSelector((state: StoreState) => state);
  const { firstName, lastName, primaryAddress, otherAddress } =
    helsinkiProfileState.profile;
  const { getStatus: getApiAccessTokenStatus } = actions;
  const apiAccessTokenStatus = getApiAccessTokenStatus();
  if (apiAccessTokenStatus === 'error') {
    return <div>{t(`${T_PATH}.apiError`)}</div>;
  }

  const getAddresses = () =>
    [primaryAddress, otherAddress].map((address, index) => (
      <div key={address.id}>
        <span
          style={{
            fontSize: 'var(--fontsize-heading-s)',
            marginTop: 'var(--spacing-s)',
          }}>
          {index === 0 ? 'Primary Address: ' : 'Other address: '}
        </span>
        <span>{`${
          i18n.language === 'sv' ? address.streetNameSv : address.streetName
        }, ${address.postalCode}, ${
          i18n.language === 'sv' ? address.citySv : address.city
        }`}</span>
      </div>
    ));
  return (
    <Container>
      <div style={{ fontSize: 'var(--fontsize-heading-m)' }}>
        Helsinki profile:
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
        <pre>{JSON.stringify(helsinkiProfileState.profile, null, 2)}</pre>
      </Card>
    </Container>
  );
};

export default ProfilePage;
