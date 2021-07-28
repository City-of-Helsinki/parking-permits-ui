import React from 'react';
import { LoadingSpinner } from 'hds-react';
import { useTranslation } from 'react-i18next';

import Hero from '../../common/hero/Hero';
import { PermitCartState, STEPPER, UserProfile } from '../../redux';

import './frontPage.scss';

import AddressSelector from '../../common/addressSelector/AddressSelector';
import VehicleSelector from '../../common/vehicleSelector/VehicleSelector';
import DurationSelector from '../../common/durationSelector/DurationSelector';
import PurchasedOverview from '../../common/purchasedOverview/PurchasedOverview';

const T_PATH = 'pages.frontPage.FrontPage';

export interface Props {
  permitCartState: PermitCartState;
  profile: UserProfile;
  currentStep: number;
}

const FrontPage = ({
  profile,
  currentStep,
  permitCartState,
}: Props): React.ReactElement => {
  const { t } = useTranslation();
  const { selectedAddress, registrationNumbers, permits } = permitCartState;
  const addresses = Object.values(profile?.addresses || {});

  const getStepperComponent = (step: number) => {
    const component = <div />;
    if (step === STEPPER.ADDRESS_SELECTOR && addresses.length) {
      return (
        <AddressSelector
          selectedAddress={selectedAddress}
          addresses={addresses}
        />
      );
    }
    if (
      (step === STEPPER.VEHICLE_SELECTOR || step === STEPPER.PERMIT_PRICES) &&
      selectedAddress
    ) {
      return <VehicleSelector cartState={permitCartState} />;
    }
    if (
      step === STEPPER.DURATION_SELECTOR &&
      selectedAddress &&
      permits &&
      registrationNumbers?.length
    ) {
      return (
        <DurationSelector
          address={selectedAddress}
          permits={permits}
          registrationNumbers={registrationNumbers}
        />
      );
    }
    // TODO: Should come from backend
    if (
      step === STEPPER.PURCHASED_VIEW &&
      selectedAddress &&
      permits &&
      registrationNumbers?.length
    ) {
      const reg = registrationNumbers[0];
      return (
        <PurchasedOverview
          address={selectedAddress}
          vehicleDetail={permits[reg].vehicle}
          validityPeriod={{
            start: 'Alkaa: 25.6.2021 klo 00:00',
            end: 'Päättyy: 25.2.2022 klo 00:00',
          }}
        />
      );
    }
    return component;
  };
  return (
    <div className="front-page">
      {addresses?.length === 0 && (
        <div className="loading-spinner">
          <LoadingSpinner />
        </div>
      )}
      {addresses.length > 0 && (
        <>
          {currentStep === 1 && (
            <Hero
              title={t(`${T_PATH}.title`, {
                firstName: profile?.firstName,
              })}
            />
          )}
          {getStepperComponent(currentStep)}
        </>
      )}
    </div>
  );
};

export default FrontPage;
