import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router';
import OrderReview from '../../common/editPermits/OrderReview';
import PriceChangePreview from '../../common/editPermits/PriceChangePreview';
import Refund from '../../common/editPermits/Refund';
import { getChangeTotal } from '../../common/editPermits/utils';
import VehicleDetails from '../../common/editPermits/VehicleDetails';
import {
  getVehiclePriceChanges,
  updatePermitVehicle,
} from '../../graphql/permitGqlClient';
import { UserProfileContext } from '../../hooks/userProfileProvider';
import { PermitStateContext } from '../../hooks/permitProvider';
import {
  ParkingContractType,
  PermitPriceChangeItem,
  PermitPriceChanges,
  ROUTES,
  Vehicle,
} from '../../types';
import {
  ErrorStateDict,
  VehicleChangeErrorContext,
} from '../../hooks/vehicleChangeErrorProvider';

enum ChangeVehicleStep {
  VEHICLE,
  PRICE_PREVIEW,
  REFUND,
  ORDER_REVIEW,
}

const T_PATH = 'common.editPermits.ChangeVehicle';

const ChangeVehicle = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const vehicleChangeErrorCtx = useContext(
    VehicleChangeErrorContext
  ) as ErrorStateDict;
  const profile = useContext(UserProfileContext)?.getProfile();
  const permitCtx = useContext(PermitStateContext);
  const [vehicle, setVehicle] = useState<Vehicle>();
  const [lowEmissionChecked, setLowEmissionChecked] = useState(false);

  const [step, setStep] = useState<ChangeVehicleStep>(
    ChangeVehicleStep.VEHICLE
  );

  const [priceChangesList, setPriceChangesList] = useState<
    PermitPriceChanges[]
  >([]);

  const permit = permitCtx?.getPermits().find(p => p.id === params.permitId);
  if (!permit || !profile) {
    return <Navigate to={ROUTES.VALID_PERMITS} />;
  }

  const priceChangeTotal = getChangeTotal(priceChangesList, 'priceChange');

  const submitVehicleChange = async (accountNumber?: string) => {
    const result = await updatePermitVehicle(
      permit.id,
      vehicle?.id,
      lowEmissionChecked,
      accountNumber
    ).catch(() => {
      vehicleChangeErrorCtx.setError(t(`${T_PATH}.permitExistError`));
    });
    if (!result) {
      return;
    }

    await permitCtx?.fetchPermits();

    if (result.refundCreated) {
      setStep(ChangeVehicleStep.ORDER_REVIEW);
    } else if (
      result.checkoutUrl &&
      permit.contractType === ParkingContractType.FIXED_PERIOD
    ) {
      window.open(result.checkoutUrl, '_self');
    } else if (priceChangeTotal > 0) {
      navigate(ROUTES.VALID_PERMITS);
    } else {
      navigate(`${ROUTES.SUCCESS}?permitId=${permit.id}`);
    }
  };

  const selectVehicle = async (selected: Vehicle) => {
    setVehicle(undefined);
    const priceChanges: PermitPriceChangeItem[] = await getVehiclePriceChanges(
      permit.id,
      selected.isLowEmission
    );
    setPriceChangesList([{ vehicle: selected, priceChanges }]);
    setVehicle(selected);
  };

  const confirmChange = async () => {
    if (priceChangeTotal < 0) {
      setStep(ChangeVehicleStep.REFUND);
    } else {
      await submitVehicleChange();
    }
  };

  const continueTo = async () => {
    if (
      permit.contractType === ParkingContractType.FIXED_PERIOD ||
      priceChangeTotal < 0
    ) {
      setStep(ChangeVehicleStep.PRICE_PREVIEW);
    } else {
      await confirmChange();
    }
  };

  return (
    <div className="change-vehicle-component">
      {step === ChangeVehicleStep.VEHICLE && (
        <VehicleDetails
          priceChanges={priceChangesList[0]?.priceChanges ?? []}
          vehicle={vehicle}
          setVehicle={selectVehicle}
          onContinue={continueTo}
          lowEmissionChecked={lowEmissionChecked}
          setLowEmissionChecked={setLowEmissionChecked}
        />
      )}
      {step === ChangeVehicleStep.PRICE_PREVIEW && priceChangesList && (
        <PriceChangePreview
          className="price-change-preview"
          priceChangesList={priceChangesList}
          isRefund={priceChangeTotal < 0}
          onCancel={() => setStep(ChangeVehicleStep.VEHICLE)}
          onConfirm={confirmChange}
        />
      )}
      {step === ChangeVehicleStep.REFUND && (
        <Refund
          refundTotal={-priceChangeTotal}
          refundTotalVat={-getChangeTotal(priceChangesList, 'priceChangeVat')}
          onCancel={() => setStep(ChangeVehicleStep.PRICE_PREVIEW)}
          onConfirm={submitVehicleChange}
        />
      )}
      {step === ChangeVehicleStep.ORDER_REVIEW && (
        <OrderReview
          className="order-review"
          address={permit.address}
          profile={profile}
          validPermits={[permit]}
          hasRefundCreated
        />
      )}
    </div>
  );
};

export default ChangeVehicle;
