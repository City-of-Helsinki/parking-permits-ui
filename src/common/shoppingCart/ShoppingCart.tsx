import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Card,
  Button,
  IconArrowLeft,
  IconArrowRight,
  NumberInput,
  SelectionGroup,
  RadioButton,
  DateInput,
} from 'hds-react';
import { useTranslation } from 'react-i18next';

import './shoppingCart.scss';
import {
  setCurrentStepper,
  setParkingDurationPeriod,
  setParkingDurationType,
  setParkingStartDate,
  setParkingStartType,
  setPurchased,
  setValidityPeriod,
} from '../../redux/actions/permitCart';
import {
  ParkingDurationType,
  ParkingStartType,
  Price,
  UserAddress,
  Vehicle,
} from '../../redux';

export interface Props {
  address: UserAddress;
  vehicleDetail: Vehicle;
  prices: Price | undefined;
  parkingDurationType?: ParkingDurationType;
  parkingStartType?: ParkingStartType;
  parkingDuration?: number;
  parkingStartFrom?: Date;
}

const ShoppingCart = ({
  address,
  prices,
  vehicleDetail,
  parkingDurationType = ParkingDurationType.FIXED_PERIOD,
  parkingStartType = ParkingStartType.IMMEDIATELY,
  parkingDuration = 1,
  parkingStartFrom = new Date(),
}: Props): React.ReactElement => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { registrationNumber, manufacturer, model } = vehicleDetail;
  const { original, offer, currency } = prices || {
    original: null,
    offer: null,
    currency: null,
  };

  const gotoStep = (count: number) => {
    dispatch(
      setValidityPeriod({
        start: 'Alkaa: 25.6.2021 klo 00:00',
        end: 'Päättyy: 25.2.2022 klo 00:00',
      })
    );
    dispatch(setPurchased(true));
    dispatch(setCurrentStepper(count));
  };

  const onChangeDurationType = (type: ParkingDurationType) => {
    dispatch(setParkingDurationType(type));
  };

  const onChangeStartType = (type: ParkingStartType) => {
    dispatch(setParkingStartType(type));
  };

  const onChangeParkingDuration = (duration: string) => {
    dispatch(setParkingDurationPeriod(parseInt(duration, 10)));
  };

  const onChangeParkingStartDate = (value: string, valueAsDate: Date) => {
    dispatch(setParkingStartDate(valueAsDate));
  };

  return (
    <div className="shopping-cart-component">
      <div className="address">
        <div className="address__symbol">{address.primary ? 'K' : 'O'}</div>
        <div className="address__type">
          {t('common.address.residentParkingZone')}
        </div>
      </div>
      <div className="time-period-selection">
        {t('page.shoppingCart.title')}
      </div>
      <Card className="card">
        <div className="car-info">
          <div className="title">{t('page.shoppingCart.subTitle')}</div>
          <div className="details">{`${registrationNumber} ${manufacturer} ${model}`}</div>
        </div>
        <div className="time-period with-bottom-border">
          <SelectionGroup
            label={t('page.shoppingCart.durationOfParkingPermit')}>
            <RadioButton
              id="v-radio-time-being"
              value={ParkingDurationType.OPEN_END}
              label={t('page.shoppingCart.openEnded')}
              checked={parkingDurationType === ParkingDurationType.OPEN_END}
              onChange={() =>
                onChangeDurationType(ParkingDurationType.OPEN_END)
              }
            />
            <RadioButton
              id="v-radio-fixedPeriod"
              value={ParkingDurationType.FIXED_PERIOD}
              label={t('page.shoppingCart.fixedPeriod')}
              checked={parkingDurationType === ParkingDurationType.FIXED_PERIOD}
              onChange={() =>
                onChangeDurationType(ParkingDurationType.FIXED_PERIOD)
              }
            />
          </SelectionGroup>
          <NumberInput
            className="month-selection"
            id="time-period-selection"
            helperText={t('page.shoppingCart.monthSelectionHelpText')}
            label=""
            min={1}
            step={1}
            max={12}
            defaultValue={parkingDuration}
            disabled={parkingDurationType !== ParkingDurationType.FIXED_PERIOD}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
              onChangeParkingDuration(e.target.value)
            }
          />
        </div>
        <div className="time-period">
          <SelectionGroup label={t('page.shoppingCart.parkingPermitStartDate')}>
            <RadioButton
              id="v-radio-immediately"
              value={ParkingStartType.IMMEDIATELY}
              label={t('page.shoppingCart.immediately')}
              checked={parkingStartType === ParkingStartType.IMMEDIATELY}
              onChange={() => onChangeStartType(ParkingStartType.IMMEDIATELY)}
            />
            <RadioButton
              id="v-radio-from"
              value={ParkingStartType.FROM}
              label={t('page.shoppingCart.from')}
              checked={parkingStartType === ParkingStartType.FROM}
              onChange={() => onChangeStartType(ParkingStartType.FROM)}
            />
          </SelectionGroup>
          <DateInput
            className="date-selection"
            placeholder={t('page.shoppingCart.datePlaceHolder')}
            id="date"
            initialMonth={parkingStartFrom}
            language="fi"
            disabled={parkingStartType !== ParkingStartType.FROM}
            onChange={onChangeParkingStartDate}
          />
        </div>
      </Card>
      <div className="price-info">
        <div>{t('page.shoppingCart.price')}</div>
        <div className="price">
          <div className="original">{`${original}${currency}/KK`}</div>
          <div className="offer">{`${offer}${currency}/KK`}</div>
        </div>
      </div>
      <div className="action-buttons">
        <Button
          theme="black"
          className="action-btn"
          onClick={() => gotoStep(4)}
          disabled={!registrationNumber?.length}>
          <span>{t('page.vehicleSelector.continue')}</span>
          <IconArrowRight />
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          onClick={() => gotoStep(2)}>
          <IconArrowLeft />
          <span>{t('page.vehicleSelector.returnToSelectRegistration')}</span>
        </Button>
      </div>
    </div>
  );
};

export default ShoppingCart;
