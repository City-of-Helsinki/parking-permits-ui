import classNames from 'classnames';
import {
  addDays,
  addMonths,
  differenceInDays,
  differenceInMonths,
} from 'date-fns';
import {
  Button,
  Card,
  IconArrowLeft,
  IconArrowRight,
  NumberInput,
} from 'hds-react';
import { orderBy } from 'lodash';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Permit from '../../common/permit/Permit';
import PermitType from '../../common/permitType/PermitType';
import { PermitStateContext } from '../../hooks/permitProvider';
import {
  ParkingContractType,
  Permit as PermitModel,
  Product,
  ROUTES,
  STEPPER,
} from '../../types';
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
  let [primaryPermit, otherPermit] = draftPermits as PermitModel[];

  if (validPermits?.length) {
    primaryPermit = validPermits.find(p => p.primaryVehicle) as PermitModel;
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
    payload: Partial<PermitModel>,
    permitId: string | undefined
  ) => permitCtx?.updatePermit(payload, permitId);

  const getCarDetails = (permit: PermitModel) => {
    const { registrationNumber, manufacturer, model } = permit.vehicle;
    return `${registrationNumber} ${manufacturer} ${model}`;
  };

  const getPrices = (permit: PermitModel) => {
    const { isLowEmission } = permit.vehicle;
    const { contractType, products } = permit;
    const isOpenEnded = contractType === ParkingContractType.OPEN_ENDED;

    const originalPrice = (product: Product) => (
      <div className="original">{`${
        (isOpenEnded ? product.unitPrice : product.totalPrice) * 2
      } €${isOpenEnded ? '/KK' : ''}`}</div>
    );
    return (
      <div className="prices">
        {products.map(product => (
          <div key={uuidv4()} className="price">
            <div>{`(${product.startDate} - ${product.endDate})`}</div>
            {isLowEmission && originalPrice(product)}
            <div className="offer">{`${
              isOpenEnded ? product.unitPrice : product.totalPrice
            } €${isOpenEnded ? '/KK' : ''}`}</div>
          </div>
        ))}
      </div>
    );
  };

  const getMaxMonth = (permit: PermitModel) => {
    if (
      permit.primaryVehicle ||
      primaryPermit.contractType === ParkingContractType.OPEN_ENDED
    ) {
      return MAX_MONTH;
    }
    const { endTime, currentPeriodEndTime } = primaryPermit;
    const endDate = new Date((endTime || currentPeriodEndTime) as string);
    const monthDiff = differenceInMonths(endDate, addDays(new Date(), 1));
    const danglingDays = differenceInDays(
      endDate,
      addMonths(addDays(new Date(), 1), monthDiff)
    );
    return danglingDays >= 1 ? monthDiff + 1 : monthDiff;
  };

  const updateMonthCount = (permitId: string, monthCount: number) =>
    updatePermitData(
      { monthCount, contractType: ParkingContractType.FIXED_PERIOD },
      permitId
    );

  return (
    <div className="duration-selector-component">
      <div className="zone__type">
        <div className="zone__type__symbol">{address.zone?.name}</div>
        <div className="zone__type__label">
          {t(`${T_PATH}.residentParkingZone`)}
        </div>
      </div>
      {!!validPermits?.length && (
        <>
          <div className="section-label">
            {t(`${T_PATH}.validPermitCount`, { count: validPermits.length })}
          </div>
          <Permit permits={validPermits} address={address} hideMap />
        </>
      )}
      <div className="section-label">
        {t(
          `${T_PATH}.${
            validPermits?.length ? 'secondPermitLabel' : 'sectionLabel'
          }`
        )}
      </div>
      {primaryPermit && (
        <PermitType
          primaryPermit={primaryPermit}
          mainPermitToUpdate={mainPermitToUpdate}
          updatePermitData={updatePermitData}
        />
      )}
      {orderBy(draftPermits, 'primaryVehicle', 'desc').map((permit, index) => (
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
            {mainPermitToUpdate.contractType ===
              ParkingContractType.OPEN_ENDED && (
              <div>{t(`${T_PATH}.openEndedAssistiveText`)}</div>
            )}

            {mainPermitToUpdate.contractType ===
              ParkingContractType.FIXED_PERIOD && (
              <div className="time-period with-bottom-border">
                <div className={classNames(`assistive-text`)}>
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
                  defaultValue={permit?.monthCount}
                  disabled={
                    mainPermitToUpdate.contractType !==
                    ParkingContractType.FIXED_PERIOD
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    updateMonthCount(
                      permit.id,
                      parseInt(e.target.value || '0', 10)
                    );
                  }}
                />
              </div>
            )}
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
