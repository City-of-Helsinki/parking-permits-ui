import {
  Button,
  Card,
  IconArrowLeft,
  IconArrowRight,
  LoadingSpinner,
  Notification,
  TextInput,
} from 'hds-react';
import React, {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getVehicleInformation } from '../../graphql/permitGqlClient';
import { PermitStateContext } from '../../hooks/permitProvider';
import { Permit, ROUTES, Vehicle } from '../../types';
import { formatDate } from '../../utils';
import './vehicleDetails.scss';

const T_PATH = 'common.editPermits.ChangeVehicle';

interface Props {
  permit: Permit;
  vehicle: Vehicle | undefined;
  onContinue: () => void;
  priceChangeMultiplier: number;
  setVehicle: Dispatch<SetStateAction<Vehicle | undefined>>;
}

const VehicleDetails: FC<Props> = ({
  permit,
  vehicle,
  setVehicle,
  onContinue,
  priceChangeMultiplier,
}): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const permitCtx = useContext(PermitStateContext);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempRegistration, setTempRegistration] = useState('');

  const inputRegistration = (event: { target: { value: string } }) => {
    setError('');
    const { value } = event.target;
    setTempRegistration(value);
    if (value && permitCtx?.permitExists(value)) {
      setError(t(`${T_PATH}.permitExistError`));
    }
  };

  const fetchVehicleInformation = useCallback(async () => {
    setLoading(true);
    setError('');
    await getVehicleInformation(tempRegistration)
      .then(setVehicle)
      .catch(errors =>
        setError(errors?.map((e: { message: string }) => e?.message).join('\n'))
      );
    setLoading(false);
  }, [setVehicle, tempRegistration]);

  return (
    <div className="vehicle-detail-component">
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
        disabled={loading || !!error?.length}
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
                    <div className="original invalid">{`${product.unitPrice} ???/KK`}</div>
                  )}
                  <div className="offer">{`${
                    product.unitPrice * priceChangeMultiplier
                  } ???/KK`}</div>
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
          onClick={() => onContinue()}>
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

export default VehicleDetails;
