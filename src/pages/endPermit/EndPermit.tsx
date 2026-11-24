import { Notification } from 'hds-react';
import { useTranslation } from 'react-i18next';
import queryString from 'query-string';
import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import PriceChangePreview from '../../common/editPermits/PriceChangePreview';
import Refund from '../../common/editPermits/Refund';
import { getChangeTotal } from '../../common/editPermits/utils';
import EndPermitResult from '../../common/endPermitResult/EndPermitResult';
import { PermitStateContext } from '../../hooks/permitProvider';
import { UserProfileContext } from '../../hooks/userProfileProvider';
import {
  ParkingContractType,
  EndPermitStep,
  PermitEndType,
  ROUTES,
  UserProfile,
} from '../../types';
import {
  calcProductDatesForRefund,
  canBeRefunded,
  upcomingProducts,
  calcVatPrice,
} from '../../utils';

const EndPermit = (): React.ReactElement => {
  const { t } = useTranslation();
  const [endFailed, setEndFailed] = useState(false);
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
  const [displayRefundNotification, setDisplayRefundNotification] =
    useState(false);

  if (permits.some(permit => permit.totalRefundAmount === null)) {
    return (
      <Notification type="info">
        {t('common.refundReviewRequired')}
      </Notification>
    );
  }
  const priceChangesList = permits.map(permit => ({
    vehicle: permit.vehicle,
    priceChanges:
      permit.contractType === ParkingContractType.FIXED_PERIOD
        ? permit.endingRefundLines
        : canBeRefunded(permit)
        ? upcomingProducts(permit).map(product => ({
            product: product.name,
            previousPrice: product.unitPrice,
            newPrice: product.unitPrice,
            priceChange: product.unitPrice,
            priceChangeVat: calcVatPrice(product.unitPrice, product.vat),
            ...calcProductDatesForRefund(product, permit),
          }))
        : [],
  }));

  const refundTotal = getChangeTotal(priceChangesList, 'priceChange');
  const endPermits = async (accountNumber: string) => {
    setEndFailed(false);
    const ended = await permitCtx?.endValidPermits(
      permitIds as string[],
      endType as string,
      accountNumber
    );
    if (ended) {
      // Use the refund status from before the permit list was refreshed.
      setDisplayRefundNotification(refundTotal > 0);
      setEndPermitState(EndPermitStep.RESULT);
    } else {
      setEndFailed(true);
    }
  };
  return (
    <div className="end-permit-component">
      {endFailed && (
        <Notification type="error">
          {t(permitCtx?.getErrorMessage() || 'common.genericError')}
        </Notification>
      )}
      <div style={{ marginTop: 'var(--spacing-l)' }} />
      {endPermitState === EndPermitStep.REFUND &&
        permitCtx?.endValidPermits && (
          <Refund
            refundTotal={refundTotal}
            refundTotalVat={getChangeTotal(priceChangesList, 'priceChangeVat')}
            onCancel={() => setEndPermitState(EndPermitStep.PRICE_PREVIEW)}
            onConfirm={endPermits}
          />
        )}
      {endPermitState === EndPermitStep.PRICE_PREVIEW && priceChangesList && (
        <PriceChangePreview
          className="price-change-preview"
          priceChangesList={priceChangesList}
          isRefund
          onCancel={() => navigate(ROUTES.VALID_PERMITS)}
          onConfirm={async () => {
            if (refundTotal > 0) {
              setEndPermitState(EndPermitStep.REFUND);
              return;
            }
            await endPermits('');
          }}
        />
      )}
      {endPermitState === EndPermitStep.RESULT && (
        <EndPermitResult
          displayRefundNotification={displayRefundNotification}
          email={profile?.email}
          endType={
            endType === PermitEndType.AFTER_CURRENT_PERIOD ||
            endType === PermitEndType.IMMEDIATELY
              ? endType
              : undefined
          }
        />
      )}
    </div>
  );
};

export default EndPermit;
