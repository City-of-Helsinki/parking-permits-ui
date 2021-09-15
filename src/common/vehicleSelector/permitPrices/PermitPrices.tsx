import classNames from 'classnames';
import {
  Button,
  Card,
  Checkbox,
  IconArrowLeft,
  IconArrowRight,
  IconMinusCircle,
  Link,
  RadioButton,
} from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { Permit, STEPPER, UserProfile } from '../../../redux';
import {
  deletePermit,
  setCurrentStepper,
  updatePermit,
} from '../../../redux/actions/permitCart';
import './permitPrices.scss';

const T_PATH = 'common.vehicleSelector.permitPrices.PermitPrices';

export interface Props {
  registrations: string[];
  userProfile: UserProfile;
  permits: { [reg: string]: Permit };
}

const DiscountCheckboxLabel = (): React.ReactElement => {
  const { t } = useTranslation();
  const discountInfoUrl =
    'https://www.hel.fi/helsinki/fi/kartat-ja-liikenne/pysakointi/vahapaastoisten_alennus';
  return (
    <>
      <span>{t(`${T_PATH}.discount`)}</span>{' '}
      <Link openInNewTab href={discountInfoUrl}>
        {t(`${T_PATH}.readMore`)}
      </Link>
    </>
  );
};

const PermitPrices = ({
  registrations,
  userProfile,
  permits,
}: Props): React.ReactElement => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [useDiscount, setDiscount] = React.useState(false);
  const onChange = (event: { target: { checked: boolean } }) => {
    setDiscount(event.target.checked);
  };
  const changePrimaryVehicle = async (
    reg: string,
    permit: Permit,
    isPrimary: boolean
  ) => {
    dispatch(
      updatePermit(userProfile, reg, permit.id, {
        primaryVehicle: isPrimary,
      })
    );
  };

  return (
    <div className="permit-prices-component">
      <div className="offer-container">
        {registrations
          .filter(reg => !!permits[reg])
          .map(reg => [reg, permits[reg]] as [string, Permit])
          .map(([reg, permit]) => (
            <div className="offer" key={reg}>
              <Card
                className={classNames('card', {
                  selected: permit.primaryVehicle,
                })}
                onClick={() => changePrimaryVehicle(reg, permit, true)}>
                {registrations.length > 1 && (
                  <RadioButton
                    className="custom-radio-btn"
                    id={uuidv4()}
                    checked={permit.primaryVehicle}
                    onChange={evt =>
                      changePrimaryVehicle(reg, permit, evt.target.checked)
                    }
                  />
                )}
                <div className="car-details">
                  <div className="registration-number">{reg}</div>
                  <div className="car-model">
                    {permit.vehicle.manufacturer} {permit.vehicle.model}
                  </div>
                  <div className="emission-level">
                    {t(
                      `${T_PATH}.${
                        permit.vehicle.isLowEmission
                          ? 'lowEmission'
                          : 'normalEmission'
                      }`,
                      {
                        emission: permit.vehicle.emission,
                      }
                    )}
                  </div>
                  <div className="price">
                    <div className="original">{`${permit.price.original} ${permit.price.currency}/KK`}</div>
                    <div className="offer">{`${permit.price.offer} ${permit.price.currency}/KK`}</div>
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
                    onClick={() =>
                      dispatch(deletePermit(userProfile, permit.id))
                    }
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
          className="discount-checkbox"
          id={uuidv4()}
          checked={useDiscount}
          onChange={onChange}
          label={<DiscountCheckboxLabel />}
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
          iconLeft={<IconArrowLeft />}
          onClick={() => dispatch(setCurrentStepper(STEPPER.VEHICLE_SELECTOR))}>
          <span>{t(`${T_PATH}.actionBtn.gotoRegistration`)}</span>
        </Button>
      </div>
    </div>
  );
};

export default PermitPrices;
