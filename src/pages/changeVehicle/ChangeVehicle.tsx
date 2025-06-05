import React, { useContext, useState, useMemo } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import PriceChangePreview from '../../common/editPermits/PriceChangePreview';
import Refund from '../../common/editPermits/Refund';
import { getChangeTotal } from '../../common/editPermits/utils';
import VehicleDetails from '../../common/editPermits/VehicleDetails';
import { updatePermitVehicle } from '../../graphql/permitGqlClient';
import { PermitStateContext } from '../../hooks/permitProvider';
import {
  ParkingContractType,
  PermitPriceChangeItem,
  PermitPriceChanges,
  ROUTES,
  Vehicle,
  Product,
  Permit,
} from '../../types';
import {
  upcomingProducts,
  canBeRefunded,
  calcProductDates,
  calcProductUnitPrice,
  calcProductUnitVatPrice,
} from '../../utils';
import { ErrorStateContext } from '../../hooks/errorProvider';

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

const getPriceChangeType = (
  vehicle: Vehicle | undefined,
  permit: Permit
): PriceChangeType => {
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

const T_PATH = 'common.editPermits.ChangeVehicle';

const ChangeVehicle = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  // NOTE: error-related state value and setter are
  // passed to ErrorContext which wraps VehicleDetails,
  // this is to have both components share a single error message
  // which is also settable by both components.
  const [error, setError] = useState('');

  const permitCtx = useContext(PermitStateContext);
  const [vehicle, setVehicle] = useState<Vehicle>();
  const [lowEmissionChecked, setLowEmissionChecked] = useState(false);

  const [step, setStep] = useState<ChangeVehicleStep>(
    ChangeVehicleStep.VEHICLE
  );

  const errorState = useMemo(
    () => ({
      error,
      setError,
    }),
    [error, setError]
  );

  const [priceChangesList, setPriceChangesList] = useState<
    PermitPriceChanges[]
  >([]);

  const permit = permitCtx?.getPermits().find(p => p.id === params.permitId);
  if (!permit) {
    return <Navigate to={ROUTES.VALID_PERMITS} />;
  }

  const updateAndNavigateToOrderView = async (accountNumber?: string) => {
    let updateSuccessful = true;
    await updatePermitVehicle(
      permit.id,
      vehicle?.id,
      lowEmissionChecked,
      accountNumber
    ).catch(() => {
      updateSuccessful = false;
      setError(t(`${T_PATH}.permitExistError`));
    });

    await permitCtx?.fetchPermits();

    if (updateSuccessful) {
      navigate(`${ROUTES.SUCCESS}?permitId=${permit.id}`);
    }
  };
  const priceChangeType = getPriceChangeType(vehicle, permit);
  const isLowEmission = vehicle?.isLowEmission;

  const getPriceChangeItem = (product: Product): PermitPriceChangeItem => {
    const previousPrice = calcProductUnitPrice(product, false);
    const previousVatPrice = calcProductUnitVatPrice(product, false);
    const newPrice = calcProductUnitPrice(product, isLowEmission);
    const newVatPrice = calcProductUnitVatPrice(product, isLowEmission);

    return {
      newPrice,
      previousPrice,
      product: product.name,
      priceChange: newPrice - previousPrice,
      priceChangeVat: newVatPrice - previousVatPrice,
      ...calcProductDates(product, permit),
    };
  };

  const continueTo = async () => {
    if (step === ChangeVehicleStep.VEHICLE) {
      setPriceChangesList([
        {
          vehicle,
          priceChanges: upcomingProducts(permit).map(getPriceChangeItem),
        },
      ]);

      if (priceChangeType === PriceChangeType.HIGHER_PRICE) {
        let updateSuccessful = true;

        const updateResult = await updatePermitVehicle(
          permit.id,
          vehicle?.id,
          lowEmissionChecked
        ).then(
          result => result,
          () => {
            updateSuccessful = false;
            setError(t(`${T_PATH}.permitExistError`));
          }
        );

        if (!updateSuccessful) {
          return;
        }

        await permitCtx?.fetchPermits();

        const checkoutUrl = updateResult?.checkoutUrl;
        if (permit.contractType === ParkingContractType.OPEN_ENDED) {
          navigate(ROUTES.VALID_PERMITS);
        } else if (checkoutUrl) {
          window.open(`${checkoutUrl}`, '_self');
        }
      } else if (canBeRefunded(permit)) {
        setStep(ChangeVehicleStep.PRICE_PREVIEW);
      } else {
        updateAndNavigateToOrderView();
      }
    }
  };

  return (
    <div className="change-vehicle-component">
      <ErrorStateContext.Provider value={errorState}>
        {step === ChangeVehicleStep.VEHICLE && (
          <VehicleDetails
            permit={permit}
            vehicle={vehicle}
            setVehicle={setVehicle}
            onContinue={continueTo}
            lowEmissionChecked={lowEmissionChecked}
            setLowEmissionChecked={setLowEmissionChecked}
          />
        )}
      </ErrorStateContext.Provider>
      {step === ChangeVehicleStep.PRICE_PREVIEW && priceChangesList && (
        <PriceChangePreview
          className="price-change-preview"
          priceChangesList={priceChangesList}
          isRefund={priceChangeType === PriceChangeType.LOWER_PRICE}
          onCancel={() => setStep(ChangeVehicleStep.VEHICLE)}
          onConfirm={() => {
            if (priceChangeType === PriceChangeType.NO_CHANGE) {
              updateAndNavigateToOrderView();
            } else {
              setStep(ChangeVehicleStep.REFUND);
            }
          }}
        />
      )}
      {step === ChangeVehicleStep.REFUND && (
        <Refund
          refundTotal={getChangeTotal(priceChangesList, 'priceChange')}
          refundTotalVat={getChangeTotal(priceChangesList, 'priceChangeVat')}
          onCancel={() => setStep(ChangeVehicleStep.PRICE_PREVIEW)}
          onConfirm={updateAndNavigateToOrderView}
        />
      )}
    </div>
  );
};

export default ChangeVehicle;
