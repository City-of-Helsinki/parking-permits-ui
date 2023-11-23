import { useCallback, useContext, useEffect, useState } from 'react';
import { ApiFetchError, FetchStatus } from '../client/types';
import {
  changeAddress,
  createDraftPermit,
  createOrder,
  deleteDraftPermit,
  endPermits,
  getAllPermits,
  getChangeAddressPriceChanges,
  updateDraftPermit,
} from '../graphql/permitGqlClient';
import {
  ParkingPermitError,
  Permit,
  PermitActions,
  PermitStatus,
  UserAddress,
  Zone,
} from '../types';
import { getEnv, formatErrors } from '../utils';
import { UserProfileContext } from './userProfileProvider';

const usePermitState = (): PermitActions => {
  const profileCtx = useContext(UserProfileContext);
  const [status, setStatus] = useState<FetchStatus>('waiting');
  const [step, setStep] = useState<number>(0);
  const [permits, setPermits] = useState<Permit[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<
    UserAddress | undefined
  >(undefined);
  const [error, setError] = useState<ApiFetchError>();

  const profile = profileCtx?.getProfile();

  const onError = (errors: ParkingPermitError[] | string | string[]) => {
    setStatus('error');
    setError(formatErrors(errors));
  };

  const fetchPermits = useCallback(async () => {
    setStatus('loading');

    await getAllPermits()
      .then(userPermits => {
        setPermits(userPermits || []);
        if (userPermits.length) {
          setSelectedAddress(
            profileCtx
              ?.getAddresses()
              .find(
                address => address?.zone?.id === userPermits[0].parkingZone.id
              )
          );
        } else if (!selectedAddress) {
          setSelectedAddress(profileCtx?.getAddresses()[0]);
        }
      })
      .catch(onError);
    setStatus('loaded');
  }, [profileCtx, selectedAddress]);

  const updatePermit = useCallback(
    async (
      payload: Partial<Permit> | Partial<Zone>,
      permitId: string | undefined
    ) => {
      setStatus('loading');
      updateDraftPermit(payload, permitId).then(fetchPermits).catch(onError);
    },
    [fetchPermits]
  );

  const createPermit = useCallback(
    async (registration: string) => {
      setStatus('loading');
      createDraftPermit(selectedAddress as UserAddress, registration)
        .then(fetchPermits)
        .catch(onError);
    },
    [selectedAddress, fetchPermits]
  );

  const deletePermit = useCallback(
    async permitId => {
      setStatus('loading');
      deleteDraftPermit(permitId).then(fetchPermits).catch(onError);
    },
    [fetchPermits]
  );

  const endValidPermits = useCallback(
    async (permitIds, endType, iban) => {
      setStatus('loading');
      endPermits(permitIds, endType, iban).then(fetchPermits).catch(onError);
    },
    [fetchPermits]
  );

  const createOrderRequest = useCallback(async () => {
    setStatus('loading');
    const order = await createOrder();
    if (order.checkoutUrl) {
      window.open(`${order?.checkoutUrl}`, '_self');
    }
  }, []);

  const changeAddressRequest = useCallback(
    async (addressId, iban) => {
      setStatus('loading');
      const { checkoutUrl } = await changeAddress(addressId, iban);
      if (checkoutUrl) {
        window.open(`${checkoutUrl}`, '_self');
      } else {
        await fetchPermits();
      }
    },
    [fetchPermits]
  );

  useEffect(() => {
    const allowedAgeLimit = getEnv('REACT_APP_ALLOWED_AGE_LIMIT');
    if (status === 'waiting' && profile && profile.age >= +allowedAgeLimit) {
      fetchPermits();
    }
  }, [fetchPermits, status, profile]);

  return {
    getStatus: () => status,
    getStep: () => step,
    getSelectedAddress: () => selectedAddress,
    permitExists: registration =>
      permits.some(
        p => p.vehicle.registrationNumber === registration.toUpperCase()
      ),
    setSelectedAddress: userAddress => setSelectedAddress(userAddress),
    getPermits: () => permits,
    fetchPermits: (): Promise<void> => fetchPermits(),
    getDraftPermits: () =>
      permits
        .filter(permit => permit.status === PermitStatus.DRAFT)
        .sort(a => (a.primaryVehicle ? -1 : 1)),
    getValidPermits: () =>
      permits.filter(
        permit =>
          [PermitStatus.VALID, PermitStatus.PAYMENT_IN_PROGRESS].includes(
            permit.status
          ) ||
          (permit.status === PermitStatus.DRAFT && permit.isOrderConfirmed)
      ),
    getChangeAddressPriceChanges,
    changeAddress: (addressId, iban) => changeAddressRequest(addressId, iban),
    setStep: count => setStep(count),
    updatePermit: (payload, permitId) => updatePermit(payload, permitId),
    deletePermit: permitId => deletePermit(permitId),
    endValidPermits: (permitIds, endType, iban) =>
      endValidPermits(permitIds, endType, iban),
    createPermit: registration => createPermit(registration),
    createOrderRequest: () => createOrderRequest(),
    clearErrorMessage: () => {
      setStatus('loaded');
      setError('');
    },
    getErrorMessage: () => {
      if (!error) {
        return undefined;
      }
      return error;
    },
  } as PermitActions;
};

export default usePermitState;
