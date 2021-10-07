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
import { first, sortBy } from 'lodash';
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
  const firstPermit = first(sortBy(permits, 'id'));

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
        isOpenEnded ? priceGross : rowPriceTotal
      } €${isOpenEnded ? '/KK' : ''}`}</div>
    );
    return (
      <div className="price">
        {isLowEmission && isOpenEnded && originalPrice}
        <div className="offer">{`${isOpenEnded ? priceGross : rowPriceTotal} €${
          isOpenEnded ? '/KK' : ''
        }`}</div>
      </div>
    );
  };

  const getMonthValue = (permit: Permit) => {
    const { monthCount: currentCount } = permit;
    const { monthCount: firstCount } = firstPermit as Permit;
    if (currentCount > firstCount) {
      updatePermitData([permit], {
        monthCount: firstCount,
      });
      return firstCount;
    }
    return currentCount;
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
                  firstPermit?.contractType === ParkingContractType.OPEN_ENDED
                }
                onClick={() =>
                  updatePermitData(permits, {
                    contractType: ParkingContractType.OPEN_ENDED,
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
                  firstPermit?.contractType === ParkingContractType.FIXED_PERIOD
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
                  firstPermit?.startType === ParkingStartType.IMMEDIATELY
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
                checked={firstPermit?.startType === ParkingStartType.FROM}
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
            initialMonth={new Date(firstPermit?.startTime as string)}
            language={(i18n?.language || 'fi') as 'fi' | 'sv' | 'en'}
            value={format(
              new Date(firstPermit?.startTime as string),
              'd.M.yyyy'
            )}
            disabled={firstPermit?.startType !== ParkingStartType.FROM}
            disableDatePicker={firstPermit?.startType !== ParkingStartType.FROM}
            onChange={(value: string, valueAsDate: Date) =>
              updatePermitData(permits, {
                startTime: valueAsDate,
              })
            }
          />
        </div>
      </Card>
      {sortBy(permits || [], 'vehicle.registrationNumber').map(
        (permit, index) => (
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
                <div className="assistive-text">
                  {t(`${T_PATH}.fixedPeriodAssistiveText`, {
                    max: index === 1 ? firstPermit?.monthCount : MAX_MONTH,
                  })}
                </div>
                <NumberInput
                  style={{ maxWidth: '250px' }}
                  className="month-selection"
                  id={uuidv4()}
                  helperText={t(`${T_PATH}.monthSelectionHelpText`, {
                    max: index === 1 ? firstPermit?.monthCount : MAX_MONTH,
                  })}
                  label=""
                  min={1}
                  step={1}
                  max={index === 1 ? firstPermit?.monthCount : MAX_MONTH}
                  defaultValue={
                    index === 0 ? permit?.monthCount : getMonthValue(permit)
                  }
                  disabled={
                    firstPermit?.contractType !==
                    ParkingContractType.FIXED_PERIOD
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    updatePermitData([permit], {
                      monthCount: parseInt(e.target.value || '0', 10),
                    });
                  }}
                />
              </div>
            </Card>
            <div className="price-info hide-in-desktop">
              <div>{t(`${T_PATH}.permitPrice`)}</div>
              {getPrices(permit)}
            </div>
          </div>
        )
      )}
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
