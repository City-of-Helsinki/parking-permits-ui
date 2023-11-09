import queryString from 'query-string';
import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PriceChangePreview from '../../common/editPermits/PriceChangePreview';
import Refund from '../../common/editPermits/Refund';
import { getChangeTotal } from '../../common/editPermits/utils';
import EndPermitResult from '../../common/endPermitResult/EndPermitResult';
import { PermitStateContext } from '../../hooks/permitProvider';
import { UserProfileContext } from '../../hooks/userProfileProvider';
import { EndPermitStep, ROUTES, UserProfile } from '../../types';
import './endPermit.scss';
import { calcProductDates, upcomingProducts } from '../../utils';

const EndPermit = (): React.ReactElement => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const profileCtx = useContext(UserProfileContext);
  const [endPermitState, setEndPermitState] = useState(
    EndPermitStep.PRICE_PREVIEW
  );

  const permitCtx = useContext(PermitStateContext);

  const validPermits = permitCtx?.getValidPermits() || [];
  const profile = profileCtx?.getProfile() as UserProfile;
  const queryStr = queryString.parse(search);
  const { permitIds: ids, endType } = queryStr;
  const permitIds = typeof ids === 'string' ? [ids] : ids;
  const permits = validPermits.filter(p => permitIds?.indexOf(p.id) !== -1);
  const getsRefund = permits.some(p => p.monthsLeft || 0);

  const priceChangesList = permits.map(permit =>
    // 1. The user gets a refund for every month they haven't "used" yet.
    // 2. A month is "used" if it has already started.
    // 3. The price per month depends on the Product valid for that month

    // Example: a user has purchased a permit from 3.11.2023 to 2.2.2024.
    // Today's date is 8.11.2023. They want to cancel their permit immediately.
    // There are 2 products:
    // 1.6.2023-30.11.2023 @ 45 EUR/month
    // 1.12.2023-30.6.204 @ 60 EUR/month
    // The total amount paid is 165 EUR (1x45 + 2x60)

    // The first month is from 3.11.2023 to 2.12.2023, and has already started
    // We therefore do not count this month, so total refund = 165-45 = 120 EUR.
    // The first product is not included as it ends in the first month.
    // We just include 2nd & 3rd month and second product.

    ({
      vehicle: permit.vehicle,
      priceChanges: upcomingProducts(permit).map(product => ({
        product: product.name,
        previousPrice: product.unitPrice,
        newPrice: product.unitPrice,
        priceChange: product.unitPrice,
        priceChangeVat: product.vat * product.unitPrice,
        ...calcProductDates(product, permit),
      })),
    })
  );

  const endPermits = (accountNumber: string) => {
    permitCtx?.endValidPermits(
      permitIds as string[],
      endType as string,
      accountNumber
    );
  };
  return (
    <div className="end-permit-component">
      <div style={{ marginTop: 'var(--spacing-l)' }} />
      {endPermitState === EndPermitStep.REFUND && permitCtx?.endValidPermits && (
        <Refund
          refundTotal={-getChangeTotal(priceChangesList, 'priceChange')}
          refundTotalVat={-getChangeTotal(priceChangesList, 'priceChangeVat')}
          onCancel={() => setEndPermitState(EndPermitStep.PRICE_PREVIEW)}
          onConfirm={accountNumber => {
            endPermits(accountNumber);
            setEndPermitState(EndPermitStep.RESULT);
          }}
        />
      )}
      {endPermitState === EndPermitStep.PRICE_PREVIEW && priceChangesList && (
        <PriceChangePreview
          className="price-change-preview"
          priceChangesList={priceChangesList}
          isRefund
          onCancel={() => navigate(ROUTES.VALID_PERMITS)}
          onConfirm={() => {
            if (getChangeTotal(priceChangesList, 'priceChange')) {
              setEndPermitState(EndPermitStep.REFUND);
            } else {
              endPermits('');
              setEndPermitState(EndPermitStep.RESULT);
            }
          }}
        />
      )}
      {endPermitState === EndPermitStep.RESULT && (
        <EndPermitResult getsRefund={getsRefund} email={profile?.email} />
      )}
    </div>
  );
};

export default EndPermit;
