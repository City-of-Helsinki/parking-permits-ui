import classNames from 'classnames';
import { addMonths, differenceInMonths } from 'date-fns';
import {
  Button,
  Card,
  IconArrowLeft,
  IconArrowRight,
  NumberInput,
} from 'hds-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import PermitType from '../../common/permitType/PermitType';
import { PermitStateContext } from '../../hooks/permitProvider';
import { ParkingContractType, Permit, ROUTES, STEPPER } from '../../types';
import './durationSelector.scss';

const MAX_MONTH = 12;
const T_PATH = 'pages.durationSelector.DurationSelector';

const DurationSelector = (): React.ReactElement => {
  const { t } = useTranslation();
  const permitCtx = useContext(PermitStateContext);
  const navigate = useNavigate();
  const draftPermits = permitCtx?.getDraftPermits();
  const validPermits = permitCtx?.getValidPermits();

  const registrationNumbers = draftPermits?.map(
    p => p.vehicle.registrationNumber
  );
  const currentStep = permitCtx?.getStep();
  const address = permitCtx?.getAddress();
  let [primaryPermit, otherPermit] = draftPermits as Permit[];

  if (validPermits?.length) {
    primaryPermit = validPermits.find(p => p.primaryVehicle) as Permit;
  }

  if (validPermits?.length && draftPermits?.length) {
    [otherPermit] = draftPermits;
  }
  const mainPermitToUpdate = validPermits?.length ? otherPermit : primaryPermit;

  if (!address) {
    return <Navigate to={ROUTES.ADDRESS} />;
  }

  if (currentStep !== STEPPER.DURATION_SELECTOR) {
    const timeOutFor = 100;
    setTimeout(() => permitCtx?.setStep(STEPPER.DURATION_SELECTOR), timeOutFor);
  }

  if (!draftPermits?.length) {
    return <Navigate to={ROUTES.PERMIT_PRICES} />;
  }

  const sendPurchaseOrderRequest = () => {
    permitCtx?.proceedToTalpa();
  };

  const updatePermitData = (
    permitsToUpdate: Permit[],
    payload: Partial<Permit>
  ) => {
    permitCtx?.updatePermit(
      permitsToUpdate.map(p => p.id),
      payload
    );
  };

  const getCarDetails = (permit: Permit) => {
    const { registrationNumber, manufacturer, model } = permit.vehicle;
    return `${registrationNumber} ${manufacturer} ${model}`;
  };

  const getPrices = (permit: Permit) => {
    const { isLowEmission } = permit.vehicle;
    const { contractType, prices } = permit;
    const { priceGross, rowPriceTotal } = prices;
    const isOpenEnded = contractType === ParkingContractType.OPEN_ENDED;

    const originalPrice = (
      <div className="original">{`${
        (isOpenEnded ? priceGross : rowPriceTotal) * 2
      } €${isOpenEnded ? '/KK' : ''}`}</div>
    );
    return (
      <div className="price">
        {isLowEmission && originalPrice}
        <div className="offer">{`${isOpenEnded ? priceGross : rowPriceTotal} €${
          isOpenEnded ? '/KK' : ''
        }`}</div>
      </div>
    );
  };

  const getMonthValue = (permit: Permit) => {
    const { monthCount: currentCount } = permit;
    const { monthCount: primaryCount } = primaryPermit;

    return currentCount > primaryCount ? primaryCount : currentCount;
  };

  const getMaxMonth = (permit: Permit) => {
    if (
      permit.id !== primaryPermit.id &&
      primaryPermit.contractType === ParkingContractType.FIXED_PERIOD
    ) {
      const { startTime, monthCount } = primaryPermit;
      const primaryEndDate = addMonths(
        new Date(startTime as string),
        monthCount
      );
      return differenceInMonths(
        primaryEndDate,
        new Date(permit.startTime as string)
      );
    }
    return MAX_MONTH;
  };

  const updateMonthCount = (currentPermit: Permit, count: number) => {
    const permitsToUpdate = [currentPermit];

    if (draftPermits.length > 1) {
      if (
        otherPermit.monthCount > count &&
        currentPermit.id !== otherPermit.id
      ) {
        permitsToUpdate.push(otherPermit);
      }
    }
    updatePermitData(permitsToUpdate, {
      monthCount: count,
      endTime: addMonths(new Date(primaryPermit.startTime as string), count),
    });
  };

  return (
    <div className="duration-selector-component">
      <div className="zone__type">
        <div className="zone__type__symbol">{address.zone?.name}</div>
        <div className="zone__type__label">
          {t(`${T_PATH}.residentParkingZone`)}
        </div>
      </div>

      <div className="section-label">{t(`${T_PATH}.sectionLabel`)}</div>
      {primaryPermit && (
        <PermitType
          primaryPermit={primaryPermit}
          mainPermitToUpdate={mainPermitToUpdate}
          permitToUpdate={otherPermit}
          updatePermitData={updatePermitData}
        />
      )}
      {draftPermits.map((permit, index) => (
        <div key={uuidv4()}>
          <Card className="card">
            <div className="header">
              <div className="car-info">
                {draftPermits.length > 1 && (
                  <div className="permit-count">
                    {t(`${T_PATH}.permitCount`, { count: index + 1 })}
                  </div>
                )}
                <div className="car-details">{getCarDetails(permit)}</div>
              </div>
              <div className="hide-in-mobile">{getPrices(permit)}</div>
            </div>
            <div className="time-period with-bottom-border">
              <div
                className={classNames(`assistive-text`, {
                  disabled:
                    mainPermitToUpdate.contractType ===
                    ParkingContractType.OPEN_ENDED,
                })}>
                {t(`${T_PATH}.fixedPeriodAssistiveText`, {
                  max: getMaxMonth(permit),
                })}
              </div>
              <NumberInput
                style={{ maxWidth: '250px' }}
                className="month-selection"
                id={uuidv4()}
                helperText={t(`${T_PATH}.monthSelectionHelpText`, {
                  max: getMaxMonth(permit),
                })}
                label=""
                min={1}
                step={1}
                max={getMaxMonth(permit)}
                defaultValue={
                  index === 0 ? permit?.monthCount : getMonthValue(permit)
                }
                disabled={
                  mainPermitToUpdate.contractType !==
                  ParkingContractType.FIXED_PERIOD
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  updateMonthCount(permit, parseInt(e.target.value || '0', 10));
                }}
              />
            </div>
          </Card>
          <div className="price-info hide-in-desktop">
            <div>{t(`${T_PATH}.permitPrice`)}</div>
            {getPrices(permit)}
          </div>
        </div>
      ))}
      <div className="action-buttons">
        <Button
          theme="black"
          className="action-btn"
          onClick={() => sendPurchaseOrderRequest()}
          disabled={!registrationNumbers?.length}>
          <span>{t(`${T_PATH}.actionBtn.continue`)}</span>
          <IconArrowRight />
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          iconLeft={<IconArrowLeft />}
          onClick={() => navigate(ROUTES.PERMIT_PRICES)}>
          <span>{t(`${T_PATH}.actionBtn.selectRegistration`)}</span>
        </Button>
      </div>
    </div>
  );
};

export default DurationSelector;
