import queryString from 'query-string';
import React, { useContext, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AccountDetail from '../../common/accountDetail/AccountDetail';
import EndPermitResult from '../../common/endPermitResult/EndPermitResult';
import Refund from '../../common/refund/Refund';
import { PermitStateContext } from '../../hooks/permitProvider';
import { UserProfileContext } from '../../hooks/userProfileProvider';
import { EndPermitStep, PermitEndType, ROUTES, UserProfile } from '../../types';
import './endPermit.scss';

const EndPermit = (): React.ReactElement => {
  const { search } = useLocation();
  const profileCtx = useContext(UserProfileContext);
  const [endPermitState, setEndPermitState] = useState(EndPermitStep.REFUND);

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
  const setState = (state: EndPermitStep) => setEndPermitState(state);
  return (
    <div className="end-permit-component">
      <div style={{ marginTop: 'var(--spacing-l)' }} />
      {endPermitState === EndPermitStep.REFUND &&
        permitCtx?.endValidPermits && (
          <Refund
            permits={permits}
            endType={endType as PermitEndType}
            profile={profile}
            getsRefund={getsRefund}
            endValidPermits={permitCtx.endValidPermits}
            setEndPermitState={setState}
          />
        )}
      {endPermitState === EndPermitStep.ACCOUNT &&
        permitCtx?.endValidPermits && (
          <AccountDetail
            permits={permits}
            endType={endType as PermitEndType}
            setEndPermitState={setState}
            endValidPermits={permitCtx.endValidPermits}
          />
        )}
      {endPermitState === EndPermitStep.RESULT && (
        <EndPermitResult getsRefund={getsRefund} email={profile.email} />
      )}
    </div>
  );
};

export default EndPermit;
