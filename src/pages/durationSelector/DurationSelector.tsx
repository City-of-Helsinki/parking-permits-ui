import classNames from 'classnames';
import { format } from 'date-fns';
import {
  Button,
  Card,
  DateInput,
  IconArrowLeft,
  IconArrowRight,
  NumberInput,
  RadioButton,
  SelectionGroup,
} from 'hds-react';
import { orderBy } from 'lodash';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { PermitStateContext } from '../../hooks/permitProvider';
import {
  ParkingContractType,
  ParkingStartType,
  Permit,
  ROUTES,
  STEPPER,
} from '../../types';
import './durationSelector.scss';

const MAX_MONTH = 12;
const T_PATH = 'pages.durationSelector.DurationSelector';

const DurationSelector = (): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const permitCtx = useContext(PermitStateContext);
  const navigate = useNavigate();
  const permits = permitCtx?.getDraftPermits();
  const registrationNumbers = permits?.map(p => p.vehicle.registrationNumber);
  const currentStep = permitCtx?.getStep();
  const address = permitCtx?.getAddress();
  const primaryPermit = permits?.find(p => p.primaryVehicle);

  if (!address) {
    return <Navigate to={ROUTES.ADDRESS} />;
  }

  if (currentStep !== STEPPER.DURATION_SELECTOR) {
    const timeOutFor = 100;
    setTimeout(() => permitCtx?.setStep(STEPPER.DURATION_SELECTOR), timeOutFor);
  }

  if (!permits?.length) {
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
    const { monthCount: firstCount } = primaryPermit as Permit;
    return currentCount > firstCount ? firstCount : currentCount;
  };

  const updateMonthCount = (currentPermit: Permit, count: number) => {
    const permitsToUpdate = [currentPermit];

    if (permits.length > 1) {
      const otherPermit = permits.find(p => !p.primaryVehicle) as Permit;
      if (
        otherPermit.monthCount > count &&
        currentPermit.id !== otherPermit.id
      ) {
        permitsToUpdate.push(otherPermit);
      }
    }
    updatePermitData(permitsToUpdate, {
      monthCount: count,
    });
  };

  // eslint-disable-next-line no-magic-numbers
  const getMaxDate = new Date(Date.now() + 12096e5);
  return (
    <div className="duration-selector-component">
      <div className="zone__type">
        <div className="zone__type__symbol">{address.zone?.name}</div>
        <div className="zone__type__label">
          {t(`${T_PATH}.residentParkingZone`)}
        </div>
      </div>

      <div className="section-label">{t(`${T_PATH}.sectionLabel`)}</div>
      <Card className="card">
        <div className="time-period with-bottom-border">
          <SelectionGroup label={t(`${T_PATH}.parkingDurationType.label`)}>
            <div className="radio-button">
              <RadioButton
                className="custom-radio-btn"
                id={uuidv4()}
                value={ParkingContractType.OPEN_ENDED}
                label={t(`${T_PATH}.openEnded`)}
                checked={
                  primaryPermit?.contractType === ParkingContractType.OPEN_ENDED
                }
                onClick={() =>
                  updatePermitData(permits, {
                    contractType: ParkingContractType.OPEN_ENDED,
                    monthCount: 1,
                  })
                }
              />
              <div className="assistive-text">
                {t(`${T_PATH}.openEndedAssistiveText`)}
              </div>
            </div>
            <div className="radio-button">
              <RadioButton
                className="custom-radio-btn"
                id={uuidv4()}
                value={ParkingContractType.FIXED_PERIOD}
                label={t(`${T_PATH}.fixedPeriod`)}
                checked={
                  primaryPermit?.contractType ===
                  ParkingContractType.FIXED_PERIOD
                }
                onClick={() =>
                  updatePermitData(permits, {
                    contractType: ParkingContractType.FIXED_PERIOD,
                  })
                }
              />
            </div>
          </SelectionGroup>
        </div>
        <div className="time-period">
          <SelectionGroup label={t(`${T_PATH}.startType.label`)}>
            <div className="radio-button">
              <RadioButton
                className="custom-radio-btn"
                id={uuidv4()}
                value={ParkingStartType.IMMEDIATELY}
                label={t(`${T_PATH}.immediately`)}
                checked={
                  primaryPermit?.startType === ParkingStartType.IMMEDIATELY
                }
                onClick={() =>
                  updatePermitData(permits, {
                    startType: ParkingStartType.IMMEDIATELY,
                  })
                }
              />
              <div className="assistive-text">
                {t(`${T_PATH}.immediatelyAssistiveText`)}
              </div>
            </div>
            <div className="radio-button">
              <RadioButton
                className="custom-radio-btn"
                id={uuidv4()}
                value={ParkingStartType.FROM}
                label={t(`${T_PATH}.startDate`)}
                checked={primaryPermit?.startType === ParkingStartType.FROM}
                onClick={() =>
                  updatePermitData(permits, {
                    startType: ParkingStartType.FROM,
                  })
                }
              />
              <div className="assistive-text">
                {t(`${T_PATH}.startDateAssistiveText`)}
              </div>
            </div>
          </SelectionGroup>
          <DateInput
            readOnly
            style={{ maxWidth: '250px' }}
            minDate={new Date()}
            maxDate={getMaxDate}
            className="date-selection"
            placeholder={t(`${T_PATH}.datePlaceHolder`)}
            id={uuidv4()}
            initialMonth={new Date(primaryPermit?.startTime as string)}
            language={(i18n?.language || 'fi') as 'fi' | 'sv' | 'en'}
            value={format(
              new Date(primaryPermit?.startTime as string),
              'd.M.yyyy'
            )}
            disabled={primaryPermit?.startType !== ParkingStartType.FROM}
            disableDatePicker={
              primaryPermit?.startType !== ParkingStartType.FROM
            }
            onChange={(value: string, valueAsDate: Date) =>
              updatePermitData(permits, {
                startTime: valueAsDate,
              })
            }
          />
        </div>
      </Card>
      {orderBy(permits || [], 'primaryVehicle', 'desc').map((permit, index) => (
        <div key={uuidv4()}>
          <Card className="card">
            <div className="header">
              <div className="car-info">
                {permits.length > 1 && (
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
                    primaryPermit?.contractType ===
                    ParkingContractType.OPEN_ENDED,
                })}>
                {t(`${T_PATH}.fixedPeriodAssistiveText`, {
                  max: index === 1 ? primaryPermit?.monthCount : MAX_MONTH,
                })}
              </div>
              <NumberInput
                style={{ maxWidth: '250px' }}
                className="month-selection"
                id={uuidv4()}
                helperText={t(`${T_PATH}.monthSelectionHelpText`, {
                  max: index === 1 ? primaryPermit?.monthCount : MAX_MONTH,
                })}
                label=""
                min={1}
                step={1}
                max={index === 1 ? primaryPermit?.monthCount : MAX_MONTH}
                defaultValue={
                  index === 0 ? permit?.monthCount : getMonthValue(permit)
                }
                disabled={
                  primaryPermit?.contractType !==
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
