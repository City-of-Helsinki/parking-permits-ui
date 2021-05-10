import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { Card, Container } from 'reactstrap';
import { ApiAccessTokenActions } from '../../client/types';
import { ApiAccessTokenContext } from '../../common/apiAccessTokenProvider';
import { StoreState, UserAddress } from '../../redux';

const ProfilePage = (): React.ReactElement => {
  const actions = useContext(ApiAccessTokenContext) as ApiAccessTokenActions;
  const { helsinkiProfileState } = useSelector((state: StoreState) => state);
  const { firstName, lastName, addresses } = helsinkiProfileState.profile;
  const { getStatus: getApiAccessTokenStatus } = actions;
  const apiAccessTokenStatus = getApiAccessTokenStatus();
  if (apiAccessTokenStatus === 'error') {
    return <div>Api access tokenin lataus epäonnistui</div>;
  }

  const getAddresses = (userAddresses: UserAddress[]) =>
    userAddresses.map(address => (
      <div key={address.id}>
        <span
          style={{
            fontSize: 'var(--fontsize-heading-s)',
            marginTop: 'var(--spacing-s)',
          }}>
          {address.primary ? 'Primary Address: ' : 'Other address: '}
        </span>
        <span>{`${address.address}, ${address.postalCode}, ${address.city}`}</span>
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
        {getAddresses(Object.values(addresses))}
      </Card>
      <div style={{ fontSize: 'var(--fontsize-heading-m)' }}>Data:</div>
      <Card>
        <pre>{JSON.stringify(helsinkiProfileState.profile, null, 2)}</pre>
      </Card>
    </Container>
  );
};

export default ProfilePage;
