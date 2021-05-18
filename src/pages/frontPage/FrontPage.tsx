import React, { useContext, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Container } from 'reactstrap';

import Hero from '../../common/hero/Hero';
import { ApiAccessTokenContext } from '../../common/apiAccessTokenProvider';
import { ApiAccessTokenActions } from '../../client/types';
import { StoreState } from '../../redux';
import { fetchUserProfile } from '../../redux/actions/helsinkiProfile';

import './frontPage.scss';
import Stepper from '../../common/stepper/Stepper';
import AddressSelector from '../../common/addressSelector/AddressSelector';
import { setSelectedAddressId } from '../../redux/actions/permitCart';
import VehicleSelector from '../../common/vehicleSelector/VehicleSelector';

const FrontPage = (): React.ReactElement => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  useLayoutEffect(() => window.scrollTo(0, 0), []);
  const { featuresState, helsinkiProfileState, permitCartState } = useSelector(
    (state: StoreState) => state
  );

  const addresses = Object.values(
    helsinkiProfileState.profile?.addresses || {}
  );

  const {
    currentStep,
    selectedAddressId,
    registrationNumber,
  } = permitCartState;
  const actions = useContext(ApiAccessTokenContext) as ApiAccessTokenActions;
  const { getStatus: getApiAccessTokenStatus } = actions;

  if (addresses.length && !selectedAddressId?.length) {
    dispatch(setSelectedAddressId(addresses[0].id));
  }

  if (
    getApiAccessTokenStatus() === 'loaded' &&
    !helsinkiProfileState?.fetchingStatus
  ) {
    dispatch(fetchUserProfile());
  }
  return (
    <div className="front-page">
      <Hero
        currentStep={currentStep}
        title={t('page.frontPage.title', {
          firstName: helsinkiProfileState.profile?.firstName,
        })}
      />
      <Container>
        <Stepper currentStep={currentStep} className="only-for-mobile" />
        {selectedAddressId && currentStep === 1 && (
          <AddressSelector
            selectedAddressId={selectedAddressId}
            addresses={addresses}
            features={featuresState.features}
          />
        )}
        {selectedAddressId && currentStep === 2 && (
          <VehicleSelector
            registrationNumber={registrationNumber}
            address={helsinkiProfileState.profile.addresses[selectedAddressId]}
          />
        )}
      </Container>
    </div>
  );
};

export default FrontPage;
