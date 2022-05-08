import { addMonths } from 'date-fns';
import queryString from 'query-string';
import React, { useContext, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import PriceChangePreview from '../../common/editPermits/PriceChangePreview';
import Refund from '../../common/editPermits/Refund';
import { getChangeTotal } from '../../common/editPermits/utils';
import EndPermitResult from '../../common/endPermitResult/EndPermitResult';
import { PermitStateContext } from '../../hooks/permitProvider';
import { UserProfileContext } from '../../hooks/userProfileProvider';
import { EndPermitStep, ROUTES, UserProfile } from '../../types';
import './endPermit.scss';

const EndPermit = (): React.ReactElement => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const profileCtx = useContext(UserProfileContext);
  const [endPermitState, setEndPermitState] = useState(
    EndPermitStep.PRICE_PREVIEW
  );

  const permitCtx = useContext(PermitStateContext);

  const validPermits = permitCtx?.getValidPermits();
  const profile = profileCtx?.getProfile() as UserProfile;
  if (!validPermits?.length) {
    return <Navigate to={ROUTES.BASE} />;
  }
  const queryStr = queryString.parse(search);
  const { permitIds: ids, endType } = queryStr;
  const permitIds = typeof ids === 'string' ? [ids] : ids;
  const permits = validPermits.filter(p => permitIds?.indexOf(p.id) !== -1);
  const getsRefund = permits.some(p => p.monthsLeft || 0);

  const priceChangesList = permits.map(permit => ({
    vehicle: permit.vehicle,
    priceChanges: permit.products.map(product => ({
      product: product.name,
      previousPrice: product.unitPrice,
      newPrice: product.unitPrice,
      priceChange: product.unitPrice,
      priceChangeVat: product.vat,
      startDate: addMonths(
        new Date(product.startDate),
        permit.monthsLeft
      ).toString(),
      endDate: product.endDate,
      monthCount: permit.monthsLeft,
    })),
  }));

  return (
    <div className="end-permit-component">
      <div style={{ marginTop: 'var(--spacing-l)' }} />
      {endPermitState === EndPermitStep.REFUND && permitCtx?.endValidPermits && (
        <Refund
          refundTotal={-getChangeTotal(priceChangesList, 'priceChange')}
          refundTotalVat={-getChangeTotal(priceChangesList, 'priceChangeVat')}
          onCancel={() => setEndPermitState(EndPermitStep.PRICE_PREVIEW)}
          onConfirm={accountNumber => {
            permitCtx?.endValidPermits(
              permitIds as string[],
              endType as string,
              accountNumber
            );
            setEndPermitState(EndPermitStep.RESULT);
          }}
        />
      )}
      {endPermitState === EndPermitStep.PRICE_PREVIEW && priceChangesList && (
        <PriceChangePreview
          className="price-change-preview"
          priceChangesList={priceChangesList}
          onCancel={() => navigate(ROUTES.VALID_PERMITS)}
          onConfirm={() => setEndPermitState(EndPermitStep.REFUND)}
        />
      )}
      {endPermitState === EndPermitStep.RESULT && (
        <EndPermitResult getsRefund={getsRefund} email={profile.email} />
      )}
    </div>
  );
};

export default EndPermit;
