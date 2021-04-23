import React, { useContext } from 'react';
import { Button } from 'hds-react';
import { ApiAccessTokenActions } from '../../client/hooks';
import { ProfileDataType, useProfile } from '../../profile';
import { AnyObject } from '../../common/types';
import { ApiAccessTokenContext } from '../../common/ApiAccessTokenProvider';

const nodeToJSON = (node: AnyObject): AnyObject | AnyObject[] => {
  if (Array.isArray(node.edges)) {
    return node.edges.map(edge => nodeToJSON(edge.node) as AnyObject);
  }
  if (node.__typename === 'VerifiedPersonalInformationNode') {
    return node;
  }
  return {
    id: String(node.id),
    value: String(
      node.address
        ? `${node.address} ${node.postalCode} ${node.city} ${node.countryCode}`
        : node.email || node.phone
    ),
    primary: String(node.primary),
  };
};

const PropToComponent = ([prop, value]: [
  string,
  ProfileDataType
]): React.ReactElement => (
  <li key={prop}>
    <strong>{prop}</strong>:{' '}
    {value && typeof value === 'object' ? (
      <pre data-test-id={`profile-data-${prop}`}>
        {JSON.stringify(nodeToJSON(value), null, 2)}
      </pre>
    ) : (
      <span data-test-id={`profile-data-${prop}`}>{value || '-'}</span>
    )}
  </li>
);

const ProfilePage = (): React.ReactElement => {
  const actions = useContext(ApiAccessTokenContext) as ApiAccessTokenActions;
  const { getStatus: getApiAccessTokenStatus } = actions;
  const {
    getStatus: getProfileStatus,
    getProfile,
    fetch,
    clear,
    getErrorMessage,
    getResultErrorMessage,
  } = useProfile();
  const apiAccessTokenStatus = getApiAccessTokenStatus();
  const profileStatus = getProfileStatus();
  const profileData = getProfile();
  const resultErrorMessage = getResultErrorMessage();
  const reload = async (): Promise<void> => {
    await clear();
    await fetch();
  };
  if (apiAccessTokenStatus === 'error') {
    return <div>Api access tokenin lataus epäonnistui</div>;
  }
  if (profileStatus === 'error') {
    return (
      <div data-test-id="profile-load-error">
        Profiilin lataus epäonnistui:
        <pre>{getErrorMessage()}</pre>
      </div>
    );
  }
  if (profileStatus !== 'loaded') {
    return <div>Ladataan....</div>;
  }
  return (
    <div>
      <h2>Profiilin tiedot:</h2>
      {profileData && (
        <ul>{Object.entries(profileData).map(arr => PropToComponent(arr))}</ul>
      )}
      {resultErrorMessage && (
        <p data-test-id="profile-data-result-error">{resultErrorMessage}</p>
      )}
      <Button onClick={reload}>Hae</Button>
    </div>
  );
};

export default ProfilePage;
