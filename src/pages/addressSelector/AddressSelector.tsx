import { Button, IconArrowRight, Notification } from 'hds-react';
import { isEmpty } from 'lodash';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import Address from '../../common/address/Address';
import Hero from '../../common/hero/Hero';
import { PermitStateContext } from '../../hooks/permitProvider';
import { UserProfileContext } from '../../hooks/userProfileProvider';
import { ROUTES, STEPPER } from '../../types';
import './addressSelector.scss';

const T_PATH = 'pages.addressSelector.AddressSelector';

const AddressSelector = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profileCtx = useContext(UserProfileContext);
  const permitCtx = useContext(PermitStateContext);
  if (!permitCtx || !profileCtx) {
    return <></>;
  }
  const { getProfile } = profileCtx;
  const { getValidPermits, getStep, setStep, getSelectedAddress } = permitCtx;

  const selectedAddress = getSelectedAddress();
  const validPermits = getValidPermits();
  const profile = getProfile();

  if (getStep() !== STEPPER.ADDRESS_SELECTOR) {
    const timeOutFor = 100;
    setTimeout(() => setStep(STEPPER.ADDRESS_SELECTOR), timeOutFor);
  }

  if (!profile || isEmpty(profile)) {
    return <Navigate to={ROUTES.BASE} />;
  }

  const { primaryAddress, otherAddress } = profile;
  const validRegistrationNumbers = validPermits?.map(
    v => v.vehicle.registrationNumber
  );

  return (
    <div className="address-selector-component">
      <Hero
        title={t(`${T_PATH}.title`, {
          firstName: profile?.firstName,
        })}
      />
      {permitCtx?.getStatus() !== 'error' && (
        <Notification label={t(`${T_PATH}.notification.info.label`)}>
          {t(`${T_PATH}.notification.info.message`)}
        </Notification>
      )}
      {permitCtx?.getStatus() === 'error' && (
        <Notification type="error">
          {t(permitCtx?.getErrorMessage() || '')}
        </Notification>
      )}
      <div className="section-label">{t(`${T_PATH}.sectionLabel`)}</div>
      <div className="addresses">
        {primaryAddress && (
          <Address
            isPrimary
            disableSelection={!!validRegistrationNumbers?.length}
            address={primaryAddress}
            selectedAddress={selectedAddress}
          />
        )}

        {otherAddress && (
          <Address
            isPrimary={false}
            address={otherAddress}
            disableSelection={!!validRegistrationNumbers?.length}
            selectedAddress={selectedAddress}
          />
        )}
      </div>
      <div className="action-buttons">
        <Button
          className="action-btn"
          onClick={() => navigate(ROUTES.PERMIT_PRICES)}
          theme="black">
          <span>{t(`${T_PATH}.actionBtn.buyPermit`)}</span>
          <IconArrowRight />
        </Button>
        <div />
      </div>
    </div>
  );
};

export default AddressSelector;
