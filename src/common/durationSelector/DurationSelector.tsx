import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch } from 'react-redux';
import {
  Card,
  Button,
  IconArrowRight,
  NumberInput,
  SelectionGroup,
  RadioButton,
  DateInput,
} from 'hds-react';
import { useTranslation } from 'react-i18next';

import './durationSelector.scss';

import {
  setCurrentStepper,
  setParkingDurationPeriod,
  setParkingDurationType,
  setParkingStartDate,
  setParkingStartType,
} from '../../redux/actions/permitCart';
import {
  Permit,
  STEPPER,
  UserAddress,
  ParkingStartType,
  ParkingDurationType,
  UserProfile,
} from '../../redux';
import { purchasePermit } from '../../redux/actions/talpa';

const T_PATH = 'common.durationSelector.DurationSelector';

export interface Props {
  userProfile: UserProfile;
  permits: { [reg: string]: Permit };
  registrationNumbers: string[];
  address: UserAddress;
}

const DurationSelector = ({
  userProfile,
  registrationNumbers,
  address,
  permits,
}: Props): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const sendPurchaseOrderRequest = () => {
    dispatch(purchasePermit(userProfile, Object.values(permits)));
    dispatch(setCurrentStepper(STEPPER.PURCHASED_VIEW));
  };
  const getOfferPrice = (permit: Permit) => {
    const { primary } = permit.vehicle;
    // eslint-disable-next-line no-magic-numbers
    return primary ? permit.prices.offer : permit.prices.offer * 1.5;
  };
  // eslint-disable-next-line no-magic-numbers
  const getMaxDate = new Date(Date.now() + 12096e5);
  return (
    <div className="duration-selector-component">
      <div className="zone__type">
        <div className="zone__type__symbol">{address.zone}</div>
        <div className="zone__type__label">
          {t(`${T_PATH}.residentParkingZone`)}
        </div>
      </div>

      <div className="section-label">{t(`${T_PATH}.sectionLabel`)}</div>
      {registrationNumbers.map((reg, index) => (
        <div key={reg}>
          <Card className="card">
            <div className="header">
              <div className="car-info">
                {registrationNumbers.length > 1 && (
                  <div className="permit-count">
                    {t(`${T_PATH}.permitCount`, { count: index + 1 })}
                  </div>
                )}
                <div className="car-details">{`${reg} ${permits[reg].vehicle.manufacturer} ${permits[reg].vehicle.model}`}</div>
              </div>

              <div className="price hide-in-mobile">
                <div className="original">{`${permits[reg].prices.original}${permits[reg].prices.currency}/KK`}</div>
                <div className="offer">{`${getOfferPrice(permits[reg])}${
                  permits[reg].prices.currency
                }/KK`}</div>
              </div>
            </div>
            <div className="time-period with-bottom-border">
              <SelectionGroup label={t(`${T_PATH}.parkingDurationType.label`)}>
                <div className="radio-button">
                  <RadioButton
                    id={uuidv4()}
                    value={ParkingDurationType.OPEN_ENDED}
                    label={t(`${T_PATH}.openEnded`)}
                    checked={
                      permits[reg].durationType ===
                      ParkingDurationType.OPEN_ENDED
                    }
                    onChange={() =>
                      dispatch(
                        setParkingDurationType(
                          reg,
                          ParkingDurationType.OPEN_ENDED
                        )
                      )
                    }
                  />
                  <div className="assistive-text">
                    {t(`${T_PATH}.openEndedAssistiveText`)}
                  </div>
                </div>
                <div className="radio-button">
                  <RadioButton
                    id={uuidv4()}
                    value={ParkingDurationType.FIXED_PERIOD}
                    label={t(`${T_PATH}.fixedPeriod`)}
                    checked={
                      permits[reg].durationType ===
                      ParkingDurationType.FIXED_PERIOD
                    }
                    onChange={() =>
                      dispatch(
                        setParkingDurationType(
                          reg,
                          ParkingDurationType.FIXED_PERIOD
                        )
                      )
                    }
                  />
                  <div className="assistive-text">
                    {t(`${T_PATH}.fixedPeriodAssistiveText`)}
                  </div>
                </div>
              </SelectionGroup>
              <NumberInput
                style={{ maxWidth: '250px' }}
                className="month-selection"
                id={uuidv4()}
                helperText={t(`${T_PATH}.monthSelectionHelpText`)}
                label=""
                min={1}
                step={1}
                max={12}
                defaultValue={permits[reg].duration}
                disabled={
                  permits[reg].durationType !== ParkingDurationType.FIXED_PERIOD
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  dispatch(
                    setParkingDurationPeriod(
                      reg,
                      parseInt(e.target.value || '0', 10)
                    )
                  );
                }}
              />
            </div>
            <div className="time-period">
              <SelectionGroup label={t(`${T_PATH}.startType.label`)}>
                <div className="radio-button">
                  <RadioButton
                    id={uuidv4()}
                    value={ParkingStartType.IMMEDIATELY}
                    label={t(`${T_PATH}.immediately`)}
                    checked={
                      permits[reg].startType === ParkingStartType.IMMEDIATELY
                    }
                    onChange={() =>
                      dispatch(
                        setParkingStartType(reg, ParkingStartType.IMMEDIATELY)
                      )
                    }
                  />
                  <div className="assistive-text">
                    {t(`${T_PATH}.immediatelyAssistiveText`)}
                  </div>
                </div>
                <div className="radio-button">
                  <RadioButton
                    id={uuidv4()}
                    value={ParkingStartType.FROM}
                    label={t(`${T_PATH}.startDate`)}
                    checked={permits[reg].startType === ParkingStartType.FROM}
                    onChange={() =>
                      dispatch(setParkingStartType(reg, ParkingStartType.FROM))
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
                initialMonth={permits[reg].startDate}
                language={(i18n?.language || 'fi') as 'fi' | 'sv' | 'en'}
                value={permits[reg]?.startDate?.toLocaleDateString()}
                disabled={permits[reg].startType !== ParkingStartType.FROM}
                disableDatePicker={
                  permits[reg].startType !== ParkingStartType.FROM
                }
                onChange={(value: string, valueAsDate: Date) =>
                  dispatch(setParkingStartDate(reg, valueAsDate))
                }
              />
            </div>
          </Card>
          <div className="price-info hide-in-desktop">
            <div>{t(`${T_PATH}.datePlaceHolder.permitPrice`)}</div>
            <div className="price">
              <div className="original">{`${permits[reg].prices.original}${permits[reg].prices.currency}/KK`}</div>
              <div className="offer">{`${getOfferPrice(permits[reg])}${
                permits[reg].prices.currency
              }/KK`}</div>
            </div>
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
          onClick={() => dispatch(setCurrentStepper(STEPPER.PERMIT_PRICES))}>
          <span>{t(`${T_PATH}.actionBtn.selectRegistration`)}</span>
        </Button>
      </div>
    </div>
  );
};

export default DurationSelector;
