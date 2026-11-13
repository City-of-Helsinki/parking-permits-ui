import { maxSecondaryMonths, validSecondaryPurchase } from '../../permitRules';
import classNames from 'classnames';
import {
  Button,
  ButtonPresetTheme,
  ButtonVariant,
  Card,
  IconArrowLeft,
  IconArrowRight,
  LoadingSpinner,
  Notification,
  NumberInput,
} from 'hds-react';
import { orderBy } from 'lodash';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import Permit from '../../common/permit/Permit';
import PermitType from '../../common/permitType/PermitType';
import { PermitStateContext } from '../../hooks/permitProvider';
import usePurchaseTime from '../../hooks/usePurchaseTime';
import {
  ParkingContractType,
  Permit as PermitModel,
  PermitStatus,
  ROUTES,
  STEPPER,
} from '../../types';
import {
  formatPermitStartDate,
  formatPermitEndDate,
  formatMonthlyPrice,
  formatPrice,
  formatDateTimeDisplay,
} from '../../utils';
import './durationSelector.scss';

const MAX_MONTH = 12;
const T_PATH = 'pages.durationSelector.DurationSelector';

const DurationSelector = (): React.ReactElement => {
  const { t: gt } = useTranslation();
  const { t } = useTranslation('translation', { keyPrefix: T_PATH });
  const permitCtx = useContext(PermitStateContext);
  const navigate = useNavigate();
  const [orderRequest, setOrderRequest] = useState<boolean>(false);
  const [contractTypeChecked, setContractTypeChecked] =
    useState<boolean>(false);
  const [startTypeChecked, setStartTypeChecked] = useState<boolean>(false);
  const [purchaseTime, setPurchaseTime] = usePurchaseTime();

  const draftPermits = permitCtx?.getDraftPermits();
  const validPermits = permitCtx?.getValidPermits();

  const registrationNumbers = draftPermits?.map(
    p => p.vehicle.registrationNumber
  );
  const currentStep = permitCtx?.getStep();
  const address = permitCtx?.getSelectedAddress();

  useEffect(() => {
    if (address && currentStep !== STEPPER.DURATION_SELECTOR) {
      permitCtx?.setStep(STEPPER.DURATION_SELECTOR);
    }
  }, [permitCtx, address, currentStep]);

  let [primaryPermit, otherPermit] = draftPermits as PermitModel[];

  if (validPermits?.length) {
    primaryPermit = validPermits.find(p => p.primaryVehicle) as PermitModel;
  }

  if (validPermits?.length && draftPermits?.length) {
    [otherPermit] = draftPermits;
  }
  const mainPermitToUpdate = validPermits?.length ? otherPermit : primaryPermit;

  const isDraft =
    mainPermitToUpdate?.status === PermitStatus.DRAFT ||
    PermitStatus.PRELIMINARY;
  const isContractTypeChecked = !isDraft || contractTypeChecked;
  const isStartTypeChecked = !isDraft || startTypeChecked;
  const isChecked = isContractTypeChecked && isStartTypeChecked;

  if (!address) {
    return <Navigate to={ROUTES.ADDRESS} />;
  }

  if (!draftPermits?.length) {
    return <Navigate to={ROUTES.PERMIT_PRICES} />;
  }

  const sendPurchaseOrderRequest = () => {
    const now = new Date();
    setPurchaseTime(now);
    if (hasInvalidDates(now)) return;
    permitCtx?.createOrderRequest();
    setOrderRequest(true);
  };

  const updatePermitData = (
    payload: Partial<PermitModel>,
    permitId: string | undefined
  ) => {
    const changesStart = 'startTime' in payload || 'startType' in payload;
    permitCtx?.updatePermit(
      changesStart
        ? {
            ...payload,
            contractType:
              payload.contractType || mainPermitToUpdate.contractType,
            monthCount: 1,
          }
        : payload,
      permitId
    );
  };

  const updateContractType = (
    payload: Partial<PermitModel>,
    permitId: string | undefined
  ) => {
    updatePermitData(payload, permitId);
    setContractTypeChecked(true);
  };

  const updateStartType = (
    payload: Partial<PermitModel>,
    permitId: string | undefined
  ) => {
    updatePermitData(payload, permitId);
    setStartTypeChecked(true);
  };

  const getCarDetails = (permit: PermitModel) => {
    const { registrationNumber, manufacturer, model } = permit.vehicle;
    return `${registrationNumber} ${manufacturer} ${model}`;
  };

  const getPrices = (permit: PermitModel) => {
    const { contractType, products } = permit;
    const isOpenEnded = contractType === ParkingContractType.OPEN_ENDED;
    return (
      <div className="prices">
        {products.map(product => (
          <div key={uuidv4()} className="price">
            <div>{`(${formatPermitStartDate(
              products,
              product,
              permit
            )} - ${formatPermitEndDate(products, product, permit)})`}</div>
            <div style={{ marginRight: '4px' }}>{t('total')}</div>
            <div className="offer">
              {isOpenEnded
                ? formatMonthlyPrice(product.unitPrice, gt)
                : `${formatPrice(product.totalPrice)} €`}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getMaxMonth = (permit: PermitModel) => {
    if (permit.primaryVehicle) {
      return MAX_MONTH;
    }
    return maxSecondaryMonths(
      primaryPermit,
      permit.startTime || purchaseTime,
      purchaseTime
    );
  };

  const hasInvalidDates = (now: Date) =>
    draftPermits.some(
      permit =>
        !permit.primaryVehicle &&
        !validSecondaryPurchase(
          primaryPermit,
          permit.startTime || now,
          permit.monthCount,
          now
        )
    );
    
  const invalidDates = hasInvalidDates(purchaseTime);

  const updateMonthCount = (permitId: string, monthCount: number) =>
    Number.isInteger(monthCount) &&
    monthCount >= 1 &&
    updatePermitData(
      { monthCount, contractType: ParkingContractType.FIXED_PERIOD },
      permitId
    );

  return (
    <div className="duration-selector-component">
      <div className="zone__type">
        <div className="zone__type__symbol">{address.zone?.name}</div>
        <div className="zone__type__label">{t('residentParkingZone')}</div>
      </div>
      {!!validPermits?.length && (
        <>
          <div className="section-label">
            {t('validPermitCount', { count: validPermits.length })}
          </div>
          <Permit permits={validPermits} address={address} hideMap />
        </>
      )}
      <div className="section-label">
        {t(validPermits?.length ? 'secondPermitLabel' : 'sectionLabel')}
      </div>
      {permitCtx?.getStatus() === 'error' && (
        <Notification type="error">{permitCtx?.getErrorMessage()}</Notification>
      )}
      {primaryPermit && (
        <PermitType
          primaryPermit={primaryPermit}
          mainPermitToUpdate={mainPermitToUpdate}
          updatePermitData={updatePermitData}
          updateContractType={updateContractType}
          updateStartType={updateStartType}
          isContractTypeChecked={isContractTypeChecked}
          isStartTypeChecked={isStartTypeChecked}
        />
      )}
      {orderBy(draftPermits, 'primaryVehicle', 'desc').map((permit, index) => (
        <div key={uuidv4()}>
          <Card className="card">
            <div className="header">
              <div className="car-info">
                {draftPermits.length > 1 && (
                  <div className="permit-count">
                    {t('permitCount', { count: index + 1 })}
                  </div>
                )}
                <div className="car-details">{getCarDetails(permit)}</div>
              </div>
              <div className="hide-in-mobile">{getPrices(permit)}</div>
            </div>
            {permit.vehicle.updatedFromTraficomOn && (
              <div className="vehicle-copyright">
                {t('vehicleCopyright', {
                  datetime: formatDateTimeDisplay(
                    permit.vehicle.updatedFromTraficomOn
                  ),
                })}
              </div>
            )}
            {mainPermitToUpdate.contractType ===
              ParkingContractType.OPEN_ENDED && (
              <div>{t('openEndedAssistiveText')}</div>
            )}

            {mainPermitToUpdate.contractType ===
              ParkingContractType.FIXED_PERIOD && (
              <div className="time-period with-bottom-border">
                <div className={classNames(`assistive-text`)}>
                  {t('fixedPeriodAssistiveText', {
                    max: getMaxMonth(permit),
                  })}
                </div>
                <NumberInput
                  style={{ maxWidth: '250px' }}
                  className="month-selection"
                  id={uuidv4()}
                  helperText={t('monthSelectionHelpText', {
                    max: getMaxMonth(permit),
                  })}
                  label=""
                  min={1}
                  step={1}
                  max={getMaxMonth(permit)}
                  value={permit?.monthCount}
                  disabled={
                    mainPermitToUpdate.contractType !==
                      ParkingContractType.FIXED_PERIOD || !startTypeChecked
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    updateMonthCount(
                      permit.id,
                      parseInt(e.target.value || '0', 10)
                    );
                  }}
                  crossOrigin={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                />
              </div>
            )}
          </Card>
          <div className="price-info hide-in-desktop">
            <div>{t('permitPrice')}</div>
            {getPrices(permit)}
          </div>
        </div>
      ))}
      {invalidDates && <Notification label={gt('secondaryPermitDates')} />}
      <div className="action-buttons">
        <Button
          theme={ButtonPresetTheme.Black}
          className="action-btn"
          iconStart={orderRequest ? <LoadingSpinner small /> : undefined}
          iconEnd={orderRequest ? undefined : <IconArrowRight />}
          onClick={() => sendPurchaseOrderRequest()}
          disabled={
            invalidDates ||
            !registrationNumbers?.length ||
            orderRequest ||
            !isChecked
          }>
          {t('actionBtn.continue')}
        </Button>

        <Button
          className="action-btn"
          theme={ButtonPresetTheme.Black}
          variant={ButtonVariant.Secondary}
          iconStart={<IconArrowLeft />}
          onClick={() => navigate(ROUTES.PERMIT_PRICES)}>
          {t('actionBtn.back')}
        </Button>
      </div>
    </div>
  );
};

export default DurationSelector;
