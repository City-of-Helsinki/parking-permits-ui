import classNames from 'classnames';
import { Button, IconArrowLeft, IconArrowRight, Notification } from 'hds-react';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import Address from '../../common/address/Address';
import OrderReview from '../../common/editPermits/OrderReview';
import PriceChangePreview from '../../common/editPermits/PriceChangePreview';
import Refund from '../../common/editPermits/Refund';
import { getPermitPriceTotal } from '../../common/editPermits/utils';
import { PermitStateContext } from '../../hooks/permitProvider';
import { UserProfileContext } from '../../hooks/userProfileProvider';
import { ParkingContractType, ROUTES, UserAddress } from '../../types';
import { PermitPriceChanges } from '../../types/permits';
import './ChangeAddress.scss';

enum ChangeAddressStep {
  ADDRESS,
  PRICE_PREVIEW,
  REFUND,
  ORDER_REVIEW,
}

const T_PATH = 'pages.changeAddress.ChangeAddress';

const ChangeAddress = (): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const [step, setStep] = useState<ChangeAddressStep>(
    ChangeAddressStep.ADDRESS
  );
  const [selectedAddress, setSelectedAddress] = useState<UserAddress>();
  const [priceChangesList, setPriceChangesList] = useState<
    PermitPriceChanges[]
  >([]);
  const [error, setError] = useState<string>('');
  const profileCtx = useContext(UserProfileContext);
  const permitCtx = useContext(PermitStateContext);
  if (!permitCtx || !profileCtx) {
    return <></>;
  }

  const { getProfile } = profileCtx;
  const { getValidPermits, getChangeAddressPriceChanges, changeAddress } =
    permitCtx;
  const validPermits = getValidPermits();
  const profile = getProfile();

  if (!profile || !validPermits || validPermits.length === 0) {
    return <Navigate to={ROUTES.BASE} />;
  }

  const {
    primaryAddress,
    otherAddress,
    primaryAddressApartment,
    primaryAddressApartmentSv,
    otherAddressApartment,
    otherAddressApartmentSv,
  } = profile;

  const forcedAddressChange = permitCtx.permitsHaveOutdatedAddresses();
  // Permits use the same address so we can read it from the first one.
  const currentPermitAddress = validPermits[0].address;
  const validCustomerAddresses = [primaryAddress, otherAddress].filter(
    e => e?.id
  );
  const userHasMultipleValidAddresses = validCustomerAddresses.length > 1;

  // Cannot update address if there's no other address to update to.
  // Skip this check on "forced" address change or in the last step of
  // the flow as by that point the forced-flag will be already unset
  // and the address has already changed.
  const skipNoMultipleValidAddressesMessage =
    forcedAddressChange || step === ChangeAddressStep.ORDER_REVIEW;
  if (!skipNoMultipleValidAddressesMessage && !userHasMultipleValidAddresses) {
    return (
      <div className="change-address-component">
        <Notification type="info">
          {t(`${T_PATH}.notification.info.noDifferentZoneMessage`)}
        </Notification>
        <div className="action-buttons">
          <Button
            className="action-btn"
            variant="secondary"
            iconLeft={<IconArrowLeft />}
            onClick={() => navigate(ROUTES.VALID_PERMITS)}
            theme="black">
            <span>{t(`${T_PATH}.actionBtn.cancel`)}</span>
          </Button>
        </div>
      </div>
    );
  }

  // Prevent no-op address-changes by excluding the current address of
  // the permits if not "forced" address change.
  const selectableAddresses = forcedAddressChange
    ? validCustomerAddresses
    : validCustomerAddresses.filter(e => e.id !== currentPermitAddress.id);

  if (!selectedAddress && selectableAddresses.length === 1) {
    setSelectedAddress(selectableAddresses[0]);
  }

  let addressApartment = '';
  if (selectedAddress === primaryAddress) {
    addressApartment =
      lang === 'sv' ? primaryAddressApartmentSv : primaryAddressApartment;
  } else {
    addressApartment =
      lang === 'sv' ? otherAddressApartmentSv : otherAddressApartment;
  }

  const priceChangeTotal = priceChangesList.reduce(
    (total, item) =>
      total + getPermitPriceTotal(item.priceChanges, 'priceChange'),
    0
  );
  const priceChangeVatTotal = priceChangesList.reduce(
    (total, item) =>
      total + getPermitPriceTotal(item.priceChanges, 'priceChangeVat'),
    0
  );

  return (
    <div className="change-address-component">
      {error && (
        <Notification type="error" className="error-notification">
          {t(error || '')}
        </Notification>
      )}
      {step === ChangeAddressStep.ADDRESS && (
        <>
          <div
            className={classNames(`addresses`, {
              fullWidth: selectableAddresses.length === 1,
            })}>
            {selectableAddresses.map(address => (
              <Address
                key={uuidv4()}
                isPrimary
                address={address}
                showControl={selectableAddresses.length > 1}
                selectedAddress={selectedAddress}
                setSelectedAddress={setSelectedAddress}
                setError={setError}
                addressApartment={addressApartment}
              />
            ))}
          </div>
          <div className="action-buttons">
            <Button
              type="submit"
              className="action-btn"
              iconRight={<IconArrowRight />}
              onClick={() => {
                if (!selectedAddress) {
                  setError(t(`${T_PATH}.errors.missingSelectedAddress`));
                  return;
                }
                getChangeAddressPriceChanges(selectedAddress.id).then(
                  changes => {
                    setPriceChangesList(changes);
                    const changeTotal = changes.reduce(
                      (total, item) =>
                        total +
                        getPermitPriceTotal(item.priceChanges, 'priceChange'),
                      0
                    );
                    const hasOpenEnded = validPermits.some(
                      permit =>
                        permit.contractType === ParkingContractType.OPEN_ENDED
                    );
                    if (changeTotal > 0 || hasOpenEnded) {
                      changeAddress(selectedAddress.id);
                      if (hasOpenEnded) setStep(ChangeAddressStep.ORDER_REVIEW);
                    } else {
                      setStep(ChangeAddressStep.PRICE_PREVIEW);
                    }
                  }
                );
              }}
              theme="black">
              <span>{t(`${T_PATH}.actionBtn.continue`)}</span>
            </Button>
            <Button
              className="action-btn"
              variant="secondary"
              iconLeft={<IconArrowLeft />}
              onClick={() => navigate(ROUTES.VALID_PERMITS)}
              theme="black">
              <span>{t(`${T_PATH}.actionBtn.cancel`)}</span>
            </Button>
          </div>
        </>
      )}
      {step === ChangeAddressStep.PRICE_PREVIEW && priceChangesList && (
        <PriceChangePreview
          className="price-change-preview"
          priceChangesList={priceChangesList}
          onCancel={() => setStep(ChangeAddressStep.ADDRESS)}
          onConfirm={() => {
            if (!selectedAddress) {
              setError(t(`${T_PATH}.errors.missingSelectedAddress`));
              return;
            }
            if (priceChangeTotal === 0) {
              changeAddress(selectedAddress.id).then(() =>
                setStep(ChangeAddressStep.ORDER_REVIEW)
              );
            } else if (priceChangeTotal < 0) {
              setStep(ChangeAddressStep.REFUND);
            }
          }}
        />
      )}
      {step === ChangeAddressStep.REFUND && (
        <Refund
          refundTotal={-priceChangeTotal}
          refundTotalVat={-priceChangeVatTotal}
          onCancel={() => setStep(ChangeAddressStep.PRICE_PREVIEW)}
          onConfirm={accountNumber => {
            if (!selectedAddress) {
              setError(t(`${T_PATH}.errors.missingSelectedAddress`));
              return;
            }
            changeAddress(selectedAddress.id, accountNumber).then(() =>
              setStep(ChangeAddressStep.ORDER_REVIEW)
            );
          }}
        />
      )}
      {step === ChangeAddressStep.ORDER_REVIEW && (
        <OrderReview
          className="order-review"
          // the address has already been updated at this point
          // => use current permit address
          address={currentPermitAddress}
          profile={profile}
          validPermits={validPermits}
          hasRefundCreated={priceChangeTotal < 0}
        />
      )}
    </div>
  );
};

export default ChangeAddress;
