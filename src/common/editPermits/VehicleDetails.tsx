import {
  Button,
  Card,
  Checkbox,
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
import {
  formatDate,
  formatErrors,
  formatMonthlyPrice,
  getPermitStartDate,
  getPermitEndDate,
  calcProductUnitPrice,
  getRestrictions,
} from '../../utils';
import './vehicleDetails.scss';
import DiscountLabel from '../discountLabel/DiscountLabel';
import {
  VehicleChangeErrorContext,
  ErrorStateDict,
} from '../../hooks/vehicleChangeErrorProvider';

const T_PATH = 'common.editPermits.ChangeVehicle';

interface Props {
  permit: Permit;
  vehicle: Vehicle | undefined;
  onContinue: () => void;
  setVehicle: Dispatch<SetStateAction<Vehicle | undefined>>;
  lowEmissionChecked: boolean;
  setLowEmissionChecked: Dispatch<SetStateAction<boolean>>;
}

const VehicleDetails: FC<Props> = ({
  permit,
  vehicle,
  setVehicle,
  onContinue,
  lowEmissionChecked,
  setLowEmissionChecked,
}): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const permitCtx = useContext(PermitStateContext);
  const [loading, setLoading] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(false);
  const [tempRegistration, setTempRegistration] = useState('');
  const vehicleChangeErrorCtx = useContext(
    VehicleChangeErrorContext
  ) as ErrorStateDict;
  const inputRegistration = (event: { target: { value: string } }) => {
    vehicleChangeErrorCtx.setError('');
    const { value } = event.target;
    setTempRegistration(value.toUpperCase());
    if (value && permitCtx?.permitExists(value)) {
      vehicleChangeErrorCtx.setError(t(`${T_PATH}.permitExistError`));
    }
  };

  const fetchVehicleInformation = useCallback(async () => {
    setLoading(true);
    vehicleChangeErrorCtx.setError('');
    await getVehicleInformation(tempRegistration)
      .then(setVehicle)
      .catch(errors => vehicleChangeErrorCtx.setError(formatErrors(errors)));
    setLoading(false);
  }, [vehicleChangeErrorCtx, setVehicle, tempRegistration]);

  const processVehicleChange = async () => {
    setProcessingRequest(true);
    const asyncOnContinue = async () => onContinue();
    await asyncOnContinue();
    setProcessingRequest(false);
  };

  const restrictions = vehicle ? getRestrictions(vehicle, t) : [];

  return (
    <div className="vehicle-detail-component">
      {vehicleChangeErrorCtx.error && (
        <Notification type="error" className="error-notification">
          {t(vehicleChangeErrorCtx.error || '')}
        </Notification>
      )}

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
        disabled={loading || !!vehicleChangeErrorCtx.error?.length}
        onClick={fetchVehicleInformation}>
        {!loading && t(`${T_PATH}.changeBtn`)}
        {loading && <LoadingSpinner small />}
      </Button>
      {vehicle && (
        <>
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
                    <div className="offer">
                      {formatMonthlyPrice(
                        calcProductUnitPrice(product, vehicle.isLowEmission),
                        t
                      )}
                    </div>
                    <div>
                      {formatDate(getPermitStartDate(product, permit))}-
                      {formatDate(getPermitEndDate(product, permit))}
                    </div>
                  </div>
                ))}
              {vehicle.updatedFromTraficomOn && (
                <div className="vehicle-copyright">
                  {t(`${T_PATH}.vehicleCopyright`)}
                </div>
              )}
            </div>
          </Card>
          {vehicle.isLowEmission && (
            <Checkbox
              className="discount-checkbox"
              id={uuidv4()}
              checked={lowEmissionChecked}
              label={<DiscountLabel />}
              onChange={evt => setLowEmissionChecked(evt.target.checked)}
            />
          )}
        </>
      )}
      <div className="action-buttons">
        <Button
          theme="black"
          className="action-btn"
          disabled={!vehicle || loading || processingRequest}
          iconRight={<IconArrowRight />}
          onClick={processVehicleChange}>
          {!processingRequest && t(`${T_PATH}.actionBtn.continue`)}
          {processingRequest && <LoadingSpinner small />}
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
