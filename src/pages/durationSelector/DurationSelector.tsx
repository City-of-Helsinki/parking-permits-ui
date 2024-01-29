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
  LoadingSpinner,
  Notification,
  NumberInput,
} from 'hds-react';
import { orderBy } from 'lodash';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Permit from '../../common/permit/Permit';
import PermitType from '../../common/permitType/PermitType';
import { PermitStateContext } from '../../hooks/permitProvider';
import {
  ParkingContractType,
  Permit as PermitModel,
  ROUTES,
  STEPPER,
} from '../../types';
import {
  formatPermitStartDate,
  formatPermitEndDate,
  formatMonthlyPrice,
  formatPrice,
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
  const draftPermits = permitCtx?.getDraftPermits();
  const validPermits = permitCtx?.getValidPermits();

  const registrationNumbers = draftPermits?.map(
    p => p.vehicle.registrationNumber
  );
  const currentStep = permitCtx?.getStep();
  const address = permitCtx?.getSelectedAddress();
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
    permitCtx?.createOrderRequest();
    setOrderRequest(true);
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
        <Notification type="error">
          {t(permitCtx?.getErrorMessage() || '')}
        </Notification>
      )}
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
                    {t('permitCount', { count: index + 1 })}
                  </div>
                )}
                <div className="car-details">{getCarDetails(permit)}</div>
              </div>
              <div className="hide-in-mobile">{getPrices(permit)}</div>
            </div>
            {permit.vehicle.updatedFromTraficomOn && (
              <div className="vehicle-copyright">{t('vehicleCopyright')}</div>
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
            <div>{t('permitPrice')}</div>
            {getPrices(permit)}
          </div>
        </div>
      ))}
      <div className="action-buttons">
        <Button
          theme="black"
          className="action-btn"
          onClick={() => sendPurchaseOrderRequest()}
          disabled={!registrationNumbers?.length || orderRequest}>
          {orderRequest && <LoadingSpinner small />}
          {!orderRequest && (
            <>
              <span>{t('actionBtn.continue')}</span>
              <IconArrowRight />
            </>
          )}
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          iconLeft={<IconArrowLeft />}
          onClick={() => navigate(ROUTES.PERMIT_PRICES)}>
          <span>{t('actionBtn.back')}</span>
        </Button>
      </div>
    </div>
  );
};

export default DurationSelector;
