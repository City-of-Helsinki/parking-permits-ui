import React, { useContext, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, IconPen, IconTrash } from 'hds-react';
import { Container } from 'reactstrap';

import Hero from '../../common/hero/Hero';
import { ApiAccessTokenContext } from '../../common/apiAccessTokenProvider';
import { ApiAccessTokenActions } from '../../client/types';
import { StoreState } from '../../redux';
import { fetchUserProfile } from '../../redux/actions/helsinkiProfile';

import './frontPage.scss';
import Stepper from '../../common/stepper/Stepper';
import AddressSelector from '../../common/addressSelector/AddressSelector';
import {
  setPurchased,
  setSelectedAddressId,
  fetchVehicleDetail,
} from '../../redux/actions/permitCart';
import VehicleSelector from '../../common/vehicleSelector/VehicleSelector';
import ShoppingCart from '../../common/shoppingCart/ShoppingCart';
import PurchasedOverview from '../../common/purchasedOverview/PurchasedOverview';
import Permit from '../../common/permit/Permit';

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
    vehicleDetail,
    prices,
    purchased,
    validityPeriod,
    parkingDurationType,
    parkingStartType,
  } = permitCartState;
  const actions = useContext(ApiAccessTokenContext) as ApiAccessTokenActions;
  const { getStatus: getApiAccessTokenStatus } = actions;

  const editPermit = () => {
    dispatch(setPurchased(false));
    dispatch(fetchVehicleDetail(undefined));
  };
  if (addresses.length && !selectedAddressId?.length) {
    dispatch(setSelectedAddressId(addresses[0].id));
  }

  if (
    getApiAccessTokenStatus() === 'loaded' &&
    !helsinkiProfileState?.fetchingStatus
  ) {
    dispatch(fetchUserProfile());
  }
  const getStepperComponent = (step: number) => {
    const component = <div />;
    if (!selectedAddressId) return component;
    if (step === 1 && purchased && vehicleDetail)
      return (
        <Permit
          address={helsinkiProfileState.profile.addresses[selectedAddressId]}
          vehicleDetail={vehicleDetail}
          validityPeriod={validityPeriod}
        />
      );

    if (step === 1) {
      return (
        <AddressSelector
          selectedAddressId={selectedAddressId}
          addresses={addresses}
          features={featuresState.features}
        />
      );
    }
    if (step === 2) {
      return (
        <VehicleSelector
          prices={prices}
          vehicleDetail={vehicleDetail}
          address={helsinkiProfileState.profile.addresses[selectedAddressId]}
        />
      );
    }
    if (vehicleDetail) {
      return step === 3 ? (
        <ShoppingCart
          prices={prices}
          parkingDurationType={parkingDurationType}
          parkingStartType={parkingStartType}
          vehicleDetail={vehicleDetail}
          address={helsinkiProfileState.profile.addresses[selectedAddressId]}
        />
      ) : (
        <PurchasedOverview
          prices={prices}
          validityPeriod={validityPeriod}
          parkingDurationType={parkingDurationType}
          parkingStartType={parkingStartType}
          vehicleDetail={vehicleDetail}
          address={helsinkiProfileState.profile.addresses[selectedAddressId]}
        />
      );
    }
    return component;
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
        <Stepper currentStep={currentStep} className="only-for-mobile" />
        {getStepperComponent(currentStep)}
        {currentStep === 1 && purchased && (
          <div className="action-buttons">
            <Button className="action-btn" onClick={editPermit}>
              <span>{t('page.frontPage.editPermit')}</span>
              <IconPen />
            </Button>

            <Button className="action-btn" variant="danger">
              <span>{t('page.frontPage.deletePermit')}</span>
              <IconTrash />
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default FrontPage;
