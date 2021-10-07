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
import { first, sortBy } from 'lodash';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { PermitStateContext } from '../../hooks/permitProvider';
import { Permit, ROUTES, STEPPER } from '../../types';
import './permitPrices.scss';

const T_PATH = 'pages.permitPrices.PermitPrices';

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

const PermitPrices = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const permitCtx = useContext(PermitStateContext);

  const permits = permitCtx?.getDraftPermits();
  const registrations = permits?.map(p => p.vehicle.registrationNumber);
  const currentStep = permitCtx?.getStep();
  const firstPermit = first(sortBy(permits, 'id'));

  const updatePermitData = (
    permitsToUpdate: Permit[],
    payload: Partial<Permit>
  ) => {
    permitCtx?.updatePermit(
      permitsToUpdate.map(p => p.id),
      payload
    );
  };

  if (!registrations?.length) {
    return <Navigate to={ROUTES.CAR_REGISTRATIONS} />;
  }

  if (currentStep !== STEPPER.PERMIT_PRICES) {
    const timeOutFor = 100;
    setTimeout(() => permitCtx?.setStep(STEPPER.PERMIT_PRICES), timeOutFor);
  }

  const getPrices = (permit: Permit) => {
    const { isLowEmission } = permit.vehicle;
    const { priceGross } = permit.prices;
    return (
      <div className="price">
        {isLowEmission && (
          <div
            className={classNames('original', {
              invalid: isLowEmission,
            })}>{`${priceGross} €/KK`}</div>
        )}
        <div className="offer">{`${priceGross} €/KK`}</div>
      </div>
    );
  };

  return (
    <div className="permit-prices-component">
      <div className="offer-container">
        {sortBy(permits || [], 'vehicle.registrationNumber')
          .filter(permit => !!permit)
          .map(
            permit =>
              [permit.vehicle.registrationNumber, permit] as [string, Permit]
          )
          .map(([reg, permit]) => (
            <div className="offer" key={permit.id}>
              <Card
                className={classNames('card', {
                  multiple: (registrations?.length || 0) > 1,
                  selected: permit.primaryVehicle,
                })}>
                {(registrations?.length || 0) > 1 && (
                  <RadioButton
                    className="custom-radio-btn"
                    id={uuidv4()}
                    checked={permit.primaryVehicle}
                    onChange={evt =>
                      updatePermitData([permit], {
                        primaryVehicle: evt.target.checked,
                      })
                    }
                  />
                )}
                <div className="car-details">
                  <div className="registration-number">{reg}</div>
                  <div className="car-model">
                    {permit.vehicle.manufacturer} {permit.vehicle.model}
                  </div>
                  <div
                    className={`emission-level ${
                      permit.vehicle.isLowEmission
                        ? 'low-emission'
                        : 'high-emission'
                    }`}>
                    {t(
                      `${T_PATH}.${
                        permit.vehicle.isLowEmission
                          ? 'lowEmissionVehicle'
                          : 'highEmissionVehicle'
                      }`
                    )}
                  </div>
                  {getPrices(permit)}
                </div>
              </Card>
              {(registrations?.length || 0) > 1 && (
                <div className="action-delete">
                  <Button
                    variant="supplementary"
                    style={{
                      color: 'var(--color-coat-of-arms)',
                    }}
                    onClick={() => permitCtx?.deletePermit(permit.id)}
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
          checked={firstPermit?.consentLowEmissionAccepted}
          onChange={evt =>
            updatePermitData(permits as Permit[], {
              consentLowEmissionAccepted: evt.target.checked,
            })
          }
          label={<DiscountCheckboxLabel />}
        />
      </div>
      <div className="action-buttons">
        <Button
          theme="black"
          className="action-btn"
          onClick={() => navigate(ROUTES.DURATION_SELECTOR)}>
          <span>{t(`${T_PATH}.actionBtn.continue`)}</span>
          <IconArrowRight />
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          iconLeft={<IconArrowLeft />}
          onClick={() => navigate(ROUTES.CAR_REGISTRATIONS)}>
          <span>{t(`${T_PATH}.actionBtn.gotoRegistration`)}</span>
        </Button>
      </div>
    </div>
  );
};

export default PermitPrices;
