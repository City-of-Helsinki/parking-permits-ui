import classNames from 'classnames';
import {
  Button,
  Card,
  IconArrowLeft,
  IconArrowRight,
  IconMinusCircle,
  RadioButton,
} from 'hds-react';
import { sortBy } from 'lodash';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import LowEmissionConsent from '../../common/lowEmissionConsent/LowEmissionConsent';
import { PermitStateContext } from '../../hooks/permitProvider';
import { Permit, ROUTES, STEPPER } from '../../types';
import { formatDate } from '../../utils';
import './permitPrices.scss';

const T_PATH = 'pages.permitPrices.PermitPrices';

const PermitPrices = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const permitCtx = useContext(PermitStateContext);

  const permits = permitCtx?.getDraftPermits();
  const registrations = permits?.map(p => p.vehicle.registrationNumber);
  const currentStep = permitCtx?.getStep();

  const updatePermitData = (payload: Partial<Permit>, permitId?: string) =>
    permitCtx?.updatePermit(payload, permitId);

  if (currentStep !== STEPPER.PERMIT_PRICES) {
    const timeOutFor = 100;
    setTimeout(() => permitCtx?.setStep(STEPPER.PERMIT_PRICES), timeOutFor);
  }

  const navigateTo = (route: ROUTES) => {
    navigate(route);
    permitCtx?.clearErrorMessage();
  };

  const getPrices = (permit: Permit) => {
    const { isLowEmission } = permit.vehicle;
    return (
      <>
        {permit.products.map(product => (
          <div key={uuidv4()} className="price">
            {isLowEmission && (
              <div
                className={classNames('original', {
                  invalid: isLowEmission,
                })}>{`${product.unitPrice * 2} €/KK`}</div>
            )}
            <div className="offer">{`${product.unitPrice} €/KK`}</div>
            <div>{`(${formatDate(product.startDate)} - ${formatDate(
              product.endDate
            )})`}</div>
          </div>
        ))}
      </>
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
                      updatePermitData({
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
            </div>
          ))}
      </div>
      {permits?.length && (
        <LowEmissionConsent
          permits={permits}
          updatePermitData={updatePermitData}
        />
      )}
      <div className="action-buttons">
        <Button
          theme="black"
          className="action-btn"
          onClick={() => navigateTo(ROUTES.DURATION_SELECTOR)}>
          <span>{t(`${T_PATH}.actionBtn.continue`)}</span>
          <IconArrowRight />
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          iconLeft={<IconArrowLeft />}
          onClick={() => navigateTo(ROUTES.ADDRESS)}>
          <span>{t(`${T_PATH}.actionBtn.gotoAddressSelection`)}</span>
        </Button>
      </div>
    </div>
  );
};

export default PermitPrices;
