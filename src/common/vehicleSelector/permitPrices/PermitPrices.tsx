import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  Checkbox,
  IconArrowRight,
  IconMinusCircle,
  RadioButton,
} from 'hds-react';

import './permitPrices.scss';

import {
  setCurrentStepper,
  setPrimaryVehicle,
  deleteRegistration,
} from '../../../redux/actions/permitCart';
import { Permit, STEPPER } from '../../../redux';

const T_PATH = 'common.vehicleSelector.permitPrices.PermitPrices';

export interface Props {
  registrations: string[];
  permits: { [reg: string]: Permit };
}

const PermitPrices = ({
  registrations,
  permits,
}: Props): React.ReactElement => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [useDiscount, setDiscount] = React.useState(false);
  const onChange = (event: { target: { checked: boolean } }) => {
    setDiscount(event.target.checked);
  };
  const changePrimaryVehicle = (
    reg: string,
    event: { target: { checked: boolean } }
  ) => {
    dispatch(setPrimaryVehicle(reg, event.target.checked));
  };
  return (
    <div className="permit-prices-component">
      <div className="offer-container">
        {registrations.map(registration => (
          <div className="offer" key={registration}>
            <Card
              className={classNames('card', {
                selected: permits[registration].vehicle.primary,
              })}>
              {registrations.length > 1 && (
                <RadioButton
                  id={uuidv4()}
                  checked={permits[registration].vehicle.primary}
                  onChange={evt => changePrimaryVehicle(registration, evt)}
                />
              )}
              <div className="car-details">
                <div className="registration-number">{registration}</div>
                <div className="car-model">
                  {permits[registration].vehicle.manufacturer}{' '}
                  {permits[registration].vehicle.model}
                </div>
                <div className="emission-level">
                  {t(`${T_PATH}.emission`, {
                    emission: permits[registration].vehicle.emission,
                  })}
                </div>
                <div className="price">
                  <div className="original">{`${permits[registration].prices.original}${permits[registration].prices.currency}/KK`}</div>
                  <div className="offer">{`${permits[registration].prices.offer}${permits[registration].prices.currency}/KK`}</div>
                </div>
              </div>
            </Card>
            {registrations.length > 1 && (
              <div className="action-delete">
                <Button
                  variant="supplementary"
                  style={{
                    color: 'var(--color-coat-of-arms)',
                  }}
                  onClick={() => dispatch(deleteRegistration(registration))}
                  iconLeft={<IconMinusCircle />}>
                  {t(`${T_PATH}.btn.delete`)}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="discount">
        <Checkbox
          id={uuidv4()}
          checked={useDiscount}
          onChange={onChange}
          label={t(`${T_PATH}.discount`)}
        />
      </div>
      <div className="action-buttons">
        <Button
          theme="black"
          className="action-btn"
          onClick={() =>
            dispatch(setCurrentStepper(STEPPER.DURATION_SELECTOR))
          }>
          <span>{t(`${T_PATH}.actionBtn.continue`)}</span>
          <IconArrowRight />
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          onClick={() => dispatch(setCurrentStepper(STEPPER.VEHICLE_SELECTOR))}>
          <span>{t(`${T_PATH}.actionBtn.gotoRegistration`)}</span>
        </Button>
      </div>
    </div>
  );
};

export default PermitPrices;
