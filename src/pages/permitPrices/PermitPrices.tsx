import classNames from 'classnames';
import {
  Button,
  Card,
  IconArrowLeft,
  IconArrowRight,
  IconMinusCircle,
  RadioButton,
  Notification,
} from 'hds-react';
import { sortBy } from 'lodash';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import LowEmissionConsent from '../../common/lowEmissionConsent/LowEmissionConsent';
import RegistrationNumber from '../../common/registrationNumber/RegistrationNumber';
import { PermitStateContext } from '../../hooks/permitProvider';
import { Permit, ROUTES, STEPPER } from '../../types';
import { formatDate, formatMonthlyPrice, getRestrictions } from '../../utils';
import './permitPrices.scss';

const T_PATH = 'pages.permitPrices.PermitPrices';

const PermitPrices = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const permitCtx = useContext(PermitStateContext);

  const permits = permitCtx?.getDraftPermits() ?? [];
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

  const restrictions = permits
    .map(permit => getRestrictions(permit.vehicle, t))
    .flat();

  const getPrices = (permit: Permit) => (
    <>
      {permit.products.map(product => (
        <div key={uuidv4()} className="price">
          <div className="offer">
            {formatMonthlyPrice(product.unitPrice, t)}
          </div>
          <div>
            ({t(`${T_PATH}.price`)}
            {` ${formatDate(product.startDate)} - ${formatDate(
              product.endDate
            )})`}
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="permit-prices-component">
      {restrictions.length > 0 && (
        <div className="permit-info">
          {restrictions.map(restriction => (
            <Notification
              key={restriction}
              type="info"
              className="info-notification restriction"
              label={t('common.restrictions.label')}>
              <div>{t('common.restrictions.text', { restriction })}</div>
              <div>{t('pages.permitPrices.PermitPrices.vehicleCopyright')}</div>
            </Notification>
          ))}
        </div>
      )}
      <div className="not-in-phone">
        <RegistrationNumber />
        <div className="permit-info">{t(`${T_PATH}.permitInfo`)}</div>
      </div>
      <div className="offer-container">
        <div className="permit-info not-in-desktop">
          {t(`${T_PATH}.permitInfo`)}
        </div>
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
                  <div className="vehicle-copyright">
                    © {t(`${T_PATH}.vehicleCopyright`)}
                  </div>
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
      {permits && permits.length > 0 && (
        <LowEmissionConsent
          permits={permits}
          updatePermitData={updatePermitData}
        />
      )}
      <div className="not-in-desktop">
        <RegistrationNumber />
      </div>
      <div className="action-buttons">
        <Button
          theme="black"
          className="action-btn"
          onClick={() => navigateTo(ROUTES.DURATION_SELECTOR)}
          disabled={!registrations?.length}>
          <span>{t(`${T_PATH}.actionBtn.continue`)}</span>
          <IconArrowRight />
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          iconLeft={<IconArrowLeft />}
          onClick={() => navigateTo(ROUTES.LANDING)}>
          <span>{t(`${T_PATH}.actionBtn.back`)}</span>
        </Button>
      </div>
    </div>
  );
};

export default PermitPrices;
