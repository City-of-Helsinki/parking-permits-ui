import React, { useContext, useState } from 'react';
import { useParams } from 'react-router';
import { Navigate, useNavigate } from 'react-router-dom';
import PriceChangePreview from '../../common/editPermits/PriceChangePreview';
import Refund from '../../common/editPermits/Refund';
import { getChangeTotal } from '../../common/editPermits/utils';
import VehicleDetails from '../../common/editPermits/VehicleDetails';
import { updatePermitVehicle } from '../../graphql/permitGqlClient';
import { PermitStateContext } from '../../hooks/permitProvider';
import { UserProfileContext } from '../../hooks/userProfileProvider';
import { PermitPriceChanges, ROUTES, Vehicle } from '../../types';

enum PriceChangeType {
  HIGHER_PRICE = 2,
  // eslint-disable-next-line no-magic-numbers
  LOWER_PRICE = 0.5,
  NO_CHANGE = 1,
}

enum ChangeVehicleStep {
  VEHICLE,
  PRICE_PREVIEW,
  REFUND,
}

const ChangeVehicle = (): React.ReactElement => {
  const navigate = useNavigate();
  const params = useParams();
  const permitCtx = useContext(PermitStateContext);
  const profileCtx = useContext(UserProfileContext);
  const [vehicle, setVehicle] = useState<Vehicle>();

  const [step, setStep] = useState<ChangeVehicleStep>(
    ChangeVehicleStep.VEHICLE
  );

  const [priceChangesList, setPriceChangesList] = useState<
    PermitPriceChanges[]
  >([]);

  const permit = permitCtx?.getPermits().find(p => p.id === params.permitId);
  if (!permit) {
    return <Navigate to={ROUTES.VALID_PERMITS} />;
  }

  const getMultiplier = (): number => {
    if (!vehicle) return PriceChangeType.NO_CHANGE;
    const { isLowEmission: currentState } = permit.vehicle;
    const { isLowEmission: newState } = vehicle;
    if (currentState !== newState) {
      return currentState && !newState
        ? PriceChangeType.HIGHER_PRICE
        : PriceChangeType.LOWER_PRICE;
    }
    return PriceChangeType.NO_CHANGE;
  };

  const updateAndNavigateToOrderView = async (accountNumber?: string) => {
    const { latestOrderId } = await updatePermitVehicle(
      permit.id,
      vehicle?.id,
      accountNumber
    );
    await permitCtx?.fetchPermits();
    navigate(`${ROUTES.SUCCESS}?orderId=${latestOrderId}`);
  };

  const continueTo = async () => {
    const multiplier = getMultiplier();
    if (
      step === ChangeVehicleStep.VEHICLE &&
      multiplier === PriceChangeType.NO_CHANGE
    ) {
      await updateAndNavigateToOrderView();
    }

    if (
      step === ChangeVehicleStep.VEHICLE &&
      multiplier !== PriceChangeType.NO_CHANGE
    ) {
      setPriceChangesList([
        {
          vehicle,
          priceChanges: permit.products.map(product => ({
            product: product.name,
            previousPrice: product.unitPrice,
            newPrice: product.unitPrice * multiplier,
            priceChange: product.unitPrice * multiplier - product.unitPrice,
            priceChangeVat: product.vat * multiplier,
            startDate: product.startDate,
            endDate: product.endDate,
            monthCount: permit.monthsLeft,
          })),
        },
      ]);

      if (multiplier === PriceChangeType.HIGHER_PRICE) {
        const { checkoutUrl } = await updatePermitVehicle(
          permit.id,
          vehicle?.id
        );
        await permitCtx?.fetchPermits();
        if (checkoutUrl && profileCtx) {
          const { id: userId } = profileCtx.getProfile();
          window.open(`${checkoutUrl}?user=${userId}`, '_self');
        }
      } else {
        setStep(ChangeVehicleStep.PRICE_PREVIEW);
      }
    }
  };

  return (
    <div className="change-vehicle-component">
      {step === ChangeVehicleStep.VEHICLE && (
        <VehicleDetails
          permit={permit}
          vehicle={vehicle}
          setVehicle={setVehicle}
          priceChangeMultiplier={getMultiplier()}
          onContinue={continueTo}
        />
      )}
      {step === ChangeVehicleStep.PRICE_PREVIEW && priceChangesList && (
        <PriceChangePreview
          className="price-change-preview"
          priceChangesList={priceChangesList}
          onCancel={() => setStep(ChangeVehicleStep.VEHICLE)}
          onConfirm={() => setStep(ChangeVehicleStep.REFUND)}
        />
      )}
      {step === ChangeVehicleStep.REFUND && (
        <Refund
          refundTotal={-getChangeTotal(priceChangesList, 'priceChange')}
          refundTotalVat={-getChangeTotal(priceChangesList, 'priceChangeVat')}
          onCancel={() => setStep(ChangeVehicleStep.PRICE_PREVIEW)}
          onConfirm={updateAndNavigateToOrderView}
        />
      )}
    </div>
  );
};

export default ChangeVehicle;
