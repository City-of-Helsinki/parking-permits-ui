import React, { useContext, useState } from 'react';
import { useParams } from 'react-router';
import { Navigate, useNavigate } from 'react-router-dom';
import PriceChangePreview from '../../common/editPermits/PriceChangePreview';
import Refund from '../../common/editPermits/Refund';
import { getChangeTotal } from '../../common/editPermits/utils';
import VehicleDetails from '../../common/editPermits/VehicleDetails';
import { updatePermitVehicle } from '../../graphql/permitGqlClient';
import { PermitStateContext } from '../../hooks/permitProvider';
import {
  ParkingContractType,
  PermitPriceChanges,
  ROUTES,
  Vehicle,
} from '../../types';
import {
  dateAsNumber,
  getMonthCount,
  isOpenEndedPermitStarted,
} from '../../utils';

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
  const [vehicle, setVehicle] = useState<Vehicle>();
  const [lowEmissionChecked, setLowEmissionChecked] = useState(false);

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
    await updatePermitVehicle(
      permit.id,
      vehicle?.id,
      lowEmissionChecked,
      accountNumber
    );
    await permitCtx?.fetchPermits();
    navigate(`${ROUTES.SUCCESS}?permitId=${permit.id}`);
  };
  const multiplier = getMultiplier();

  const continueTo = async () => {
    if (step === ChangeVehicleStep.VEHICLE) {
      setPriceChangesList([
        {
          vehicle,
          priceChanges: permit.products
            .filter(
              product => new Date().valueOf() <= dateAsNumber(product.endDate)
            )
            .map(product => ({
              product: product.name,
              previousPrice: product.unitPrice,
              newPrice: product.unitPrice * multiplier,
              priceChange:
                multiplier === PriceChangeType.NO_CHANGE
                  ? 0
                  : product.unitPrice * multiplier * (multiplier < 1 ? -1 : 1),
              priceChangeVat:
                multiplier === PriceChangeType.NO_CHANGE
                  ? 0
                  : product.vat *
                    product.unitPrice *
                    multiplier *
                    (multiplier < 1 ? -1 : 1),
              startDate: product.startDate,
              endDate: product.endDate,
              monthCount: getMonthCount(
                new Date(),
                permit.startTime as string,
                product,
                permit.endTime as string
              ),
            })),
        },
      ]);

      if (multiplier === PriceChangeType.HIGHER_PRICE) {
        const { checkoutUrl } = await updatePermitVehicle(
          permit.id,
          vehicle?.id,
          lowEmissionChecked
        );
        await permitCtx?.fetchPermits();
        if (permit.contractType === ParkingContractType.OPEN_ENDED) {
          navigate(ROUTES.VALID_PERMITS);
        } else if (checkoutUrl) {
          window.open(`${checkoutUrl}`, '_self');
        }
      } else if (isOpenEndedPermitStarted([permit])) {
        updateAndNavigateToOrderView();
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
          lowEmissionChecked={lowEmissionChecked}
          setLowEmissionChecked={setLowEmissionChecked}
        />
      )}
      {step === ChangeVehicleStep.PRICE_PREVIEW && priceChangesList && (
        <PriceChangePreview
          className="price-change-preview"
          priceChangesList={priceChangesList}
          onCancel={() => setStep(ChangeVehicleStep.VEHICLE)}
          onConfirm={() => {
            if (multiplier === PriceChangeType.NO_CHANGE) {
              updateAndNavigateToOrderView();
            } else {
              setStep(ChangeVehicleStep.REFUND);
            }
          }}
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
