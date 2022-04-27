import {
  Button,
  Card,
  IconArrowLeft,
  IconArrowRight,
  LoadingSpinner,
  Notification,
  TextInput,
} from 'hds-react';
import React, { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Navigate, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  getVehicleInformation,
  updatePermitVehicle,
} from '../../graphql/permitGqlClient';
import { PermitStateContext } from '../../hooks/permitProvider';
import { ROUTES, Vehicle } from '../../types';
import { formatDate } from '../../utils';
import './changeVehicle.scss';

const T_PATH = 'pages.changeVehicle.ChangeVehicle';

const ChangeVehicle = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const permitCtx = useContext(PermitStateContext);
  const [tempRegistration, setTempRegistration] = useState('');
  const [vehicle, setVehicle] = useState<Vehicle>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchVehicleInformation = useCallback(async () => {
    setLoading(true);
    setError('');
    await getVehicleInformation(tempRegistration)
      .then(setVehicle)
      .catch(errors =>
        setError(errors?.map((e: { message: string }) => e?.message).join('\n'))
      );
    setLoading(false);
  }, [tempRegistration]);

  const permit = permitCtx?.getPermits().find(p => p.id === params.permitId);
  if (!permit) {
    return <Navigate to={ROUTES.VALID_PERMITS} />;
  }
  const inputRegistration = (event: { target: { value: string } }) => {
    setError('');
    const { value } = event.target;
    setTempRegistration(value);
  };

  const getMultiplier = (): number => {
    if (!vehicle) return 1;
    const { isLowEmission: currentState } = permit.vehicle;
    const { isLowEmission: newState } = vehicle;
    if (currentState !== newState) {
      // eslint-disable-next-line no-magic-numbers
      return currentState && !newState ? 2 : 0.5;
    }
    return 1;
  };

  const continueTo = async () => {
    const multiplier = getMultiplier();
    if (multiplier === 1) {
      await updatePermitVehicle(permit.id, vehicle?.id);
      await permitCtx?.fetchPermits();
      navigate(`${ROUTES.SUCCESS}?orderId=${permit?.orderId}`);
    }
  };

  return (
    <div className="change-vehicle-component">
      {error && (
        <Notification type="error" className="error-notification">
          {t(error || '')}
        </Notification>
      )}
      <div className="section-label">{t(`${T_PATH}.sectionLabel`)}</div>
      <TextInput
        id={uuidv4()}
        maxLength={7}
        value={tempRegistration}
        label={t(`${T_PATH}.input.label`)}
        onChange={inputRegistration}
        className="registration-input"
        helperText={t(`${T_PATH}.input.helpText`)}
      />
      <Button
        variant="secondary"
        className="change-btn"
        disabled={loading}
        onClick={fetchVehicleInformation}>
        {!loading && t(`${T_PATH}.changeBtn`)}
        {loading && <LoadingSpinner small />}
      </Button>

      {vehicle && (
        <Card className="card">
          <div className="car-details">
            <div className="registration-number">
              {vehicle.registrationNumber}
            </div>
            <div className="car-model">
              {vehicle.manufacturer} {vehicle.model}
            </div>
            <div
              className={`emission-level ${
                vehicle.isLowEmission ? 'low-emission' : 'high-emission'
              }`}>
              {t(
                `${T_PATH}.${
                  vehicle.isLowEmission
                    ? 'lowEmissionVehicle'
                    : 'highEmissionVehicle'
                }`
              )}
            </div>
            {permit &&
              vehicle &&
              permit.products.map(product => (
                <div key={uuidv4()} className="price">
                  {permit.vehicle.isLowEmission !== vehicle.isLowEmission && (
                    <div className="original invalid">{`${product.unitPrice} €/KK`}</div>
                  )}
                  <div className="offer">{`${
                    product.unitPrice * getMultiplier()
                  } €/KK`}</div>
                  <div>{`(${formatDate(product.startDate)} - ${formatDate(
                    product.endDate
                  )})`}</div>
                </div>
              ))}
          </div>
        </Card>
      )}
      <div className="action-buttons">
        <Button
          theme="black"
          className="action-btn"
          disabled={!vehicle}
          iconRight={<IconArrowRight />}
          onClick={() => continueTo()}>
          {t(`${T_PATH}.actionBtn.continue`)}
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          iconLeft={<IconArrowLeft />}
          onClick={() => navigate(ROUTES.VALID_PERMITS)}>
          {t(`${T_PATH}.actionBtn.back`)}
        </Button>
      </div>
    </div>
  );
};

export default ChangeVehicle;
