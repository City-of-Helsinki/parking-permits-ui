import React, { useContext, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Container } from 'reactstrap';
import { Button, IconArrowRight, Notification } from 'hds-react';

import Hero from '../../common/hero/Hero';
import { ApiAccessTokenContext } from '../../common/ApiAccessTokenProvider';
import { ApiAccessTokenActions } from '../../client/types';
import { StoreState } from '../../redux';
import { fetchUserProfile } from '../../redux/actions/helsinkiProfile';
import ParkingZonesMap from '../../common/parking-zone-map/ParkingZonesMap';
import Address from '../../common/address/address';

import './FrontPage.scss';
import Stepper from '../../common/stepper/Stepper';
import { setCurrentStepper } from '../../redux/actions/permitCart';

const FrontPage = (): React.ReactElement => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  useLayoutEffect(() => window.scrollTo(0, 0), []);
  const [selectedItem, setSelectedItem] = React.useState('');
  const { featuresState, helsinkiProfileState, permitCartState } = useSelector(
    (state: StoreState) => state
  );

  const { currentStep } = permitCartState;
  const addresses = Object.values(
    helsinkiProfileState?.profile?.addresses || {}
  );
  const actions = useContext(ApiAccessTokenContext) as ApiAccessTokenActions;
  const { getStatus: getApiAccessTokenStatus } = actions;

  if (
    getApiAccessTokenStatus() === 'loaded' &&
    !helsinkiProfileState?.fetchingStatus
  ) {
    dispatch(fetchUserProfile());
  }

  if (addresses.length && !selectedItem?.length) {
    setSelectedItem(addresses[0].id);
  }

  const onChange = (event: { target: { value: string } }) => {
    setSelectedItem(event.target.value);
  };

  const gotoNext = () => {
    dispatch(setCurrentStepper(currentStep + 1));
  };
  return (
    <div className="front-page">
      <Hero
        currentStep={currentStep}
        title={t('page.frontPage.title', {
          firstName: helsinkiProfileState.profile?.firstName,
        })}
      />
      <Container>
        <Stepper
          currentStep={currentStep}
          className="only-for-mobile"
          style={{ marginBottom: 'var(--spacing-s)' }}
        />
        <Notification
          className="notification"
          label={t('page.frontPage.notification.info.label')}>
          {t('page.frontPage.notification.info.message')}
        </Notification>
        <div className="select-address-title">
          {t('page.frontPage.selectAddress')}
        </div>
        <div className="addresses">
          {addresses?.length &&
            addresses.map(address => (
              <Address
                key={address.id}
                selectedItem={selectedItem}
                address={address}
                onChange={onChange}>
                {featuresState.features[address.id] && (
                  <ParkingZonesMap
                    featureCollection={featuresState.features[address.id]}
                    zoom={13}
                  />
                )}
              </Address>
            ))}
        </div>
        <Button className="action-btn" onClick={gotoNext}>
          <span>{t('page.frontPage.buyParkingId')}</span>
          <IconArrowRight />
        </Button>
      </Container>
    </div>
  );
};

export default FrontPage;
