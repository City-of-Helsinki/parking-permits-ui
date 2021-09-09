import { LoadingSpinner } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AddressSelector from '../../common/addressSelector/AddressSelector';
import DurationSelector from '../../common/durationSelector/DurationSelector';
import Hero from '../../common/hero/Hero';
import PurchasedOverview from '../../common/purchasedOverview/PurchasedOverview';
import VehicleSelector from '../../common/vehicleSelector/VehicleSelector';
import {
  PermitCartState,
  ProcessingStatus,
  STEPPER,
  TalpaState,
  UserProfile,
} from '../../redux';
import './frontPage.scss';

const T_PATH = 'pages.frontPage.FrontPage';

export interface Props {
  permitCartState: PermitCartState;
  talpaState?: TalpaState;
  profile: UserProfile;
  currentStep: number;
}

const FrontPage = ({
  profile,
  currentStep,
  talpaState,
  permitCartState,
}: Props): React.ReactElement => {
  const { t } = useTranslation();
  const { selectedAddress, registrationNumbers, permits } = permitCartState;
  const { primaryAddress, otherAddress } = profile;

  const getStepperComponent = (step: number) => {
    const component = <div />;
    if (step === STEPPER.ADDRESS_SELECTOR && primaryAddress) {
      return (
        <AddressSelector
          selectedAddress={selectedAddress}
          primaryAddress={primaryAddress}
          otherAddress={otherAddress}
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
          userProfile={profile}
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
      const validPermits = registrationNumbers.map(reg => permits[reg]);
      return (
        <>
          {talpaState?.fetchingStatus === ProcessingStatus.PROCESSING && (
            <div
              className="loading-spinner"
              style={{ flexDirection: 'column' }}>
              <LoadingSpinner small />
              <div
                style={{
                  marginTop: 'var(--spacing-s)',
                }}>
                Sending request to talpa....
              </div>
            </div>
          )}
          {talpaState?.fetchingStatus !== ProcessingStatus.PROCESSING && (
            <PurchasedOverview
              address={selectedAddress}
              permits={validPermits}
            />
          )}
        </>
      );
    }
    return component;
  };
  return (
    <div className="front-page">
      {!primaryAddress && (
        <div className="loading-spinner">
          <LoadingSpinner />
        </div>
      )}
      {primaryAddress && (
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
