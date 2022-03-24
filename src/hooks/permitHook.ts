import { orderBy } from 'lodash';
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
  updateVehicleRegistration,
} from '../graphql/permitGqlClient';
import {
  ParkingPermitError,
  Permit,
  PermitActions,
  PermitStatus,
  UserAddress,
  Zone,
} from '../types';
import { getEnv } from '../utils';
import { UserProfileContext } from './userProfileProvider';

const usePermitState = (): PermitActions => {
  const profileCtx = useContext(UserProfileContext);
  const [status, setStatus] = useState<FetchStatus>('waiting');
  const [step, setStep] = useState<number>(0);
  const [validPermits, setValidPermits] = useState<Permit[]>([]);
  const [draftPermits, setDraftPermits] = useState<Permit[]>([]);
  const [address, setAddress] = useState<UserAddress | undefined>(undefined);
  const [error, setError] = useState<ApiFetchError>();

  const profile = profileCtx?.getProfile();

  const onError = (errors: ParkingPermitError[] | string | string[]) => {
    setStatus('error');
    if (!errors) {
      return setError('Some thing went wrong');
    }
    if (typeof errors === 'string') {
      return setError(errors);
    }
    return setError(
      errors.map(e => (typeof e !== 'string' && e?.message) || e).join('\n')
    );
  };

  const fetchPermits = useCallback(async () => {
    setStatus('loading');

    const { permits: userPermits, success, errors } = await getAllPermits();
    if (!success) {
      onError(errors);
      return;
    }
    const vPermits = (userPermits || []).filter(
      permit => permit.status === PermitStatus.VALID
    );
    setDraftPermits(
      (userPermits || []).filter(permit => permit.status === PermitStatus.DRAFT)
    );
    setValidPermits(vPermits);
    if (vPermits?.length > 0 && profile) {
      const { primaryAddress, otherAddress } = profile;
      const firstPermit = vPermits[0];
      const selectedAdd = [primaryAddress, otherAddress].find(
        add => add.zone?.id === firstPermit.parkingZone.id
      );
      setAddress(selectedAdd);
    }
    if (!address && profile) {
      const { primaryAddress } = profile;
      setAddress(primaryAddress);
    }
    setStatus('loaded');
  }, [address, profile]);

  const updatePermit = useCallback(
    async (
      payload: Partial<Permit> | Partial<Zone>,
      permitId: string | undefined
    ) => {
      setStatus('loading');
      const { permits, success, errors } = await updateDraftPermit(
        payload,
        permitId
      );
      if (!success) {
        onError(errors);
        return;
      }
      if ('primaryVehicle' in payload) {
        await fetchPermits();
        return;
      }
      const drafts = (permits || []).filter(
        permit => permit.status !== PermitStatus.VALID
      );
      setDraftPermits(orderBy(drafts || [], 'primaryVehicle', 'desc'));
      setValidPermits(
        (permits || []).filter(permit => permit.status === PermitStatus.VALID)
      );
      setStatus('loaded');
    },
    [fetchPermits]
  );

  const createPermit = useCallback(async () => {
    setStatus('loading');
    const { success, errors, permits } = await createDraftPermit(
      address as UserAddress
    );
    if (!success) {
      onError(errors);
      return;
    }
    const drafts = (permits || []).filter(
      permit => permit.status !== PermitStatus.VALID
    );
    setDraftPermits(orderBy(drafts || [], 'primaryVehicle', 'desc'));
    setStatus('loaded');
  }, [address]);

  const deletePermit = useCallback(
    async permitId => {
      setStatus('loading');
      const { success } = await deleteDraftPermit(permitId);
      if (success) {
        await fetchPermits();
      }
    },
    [fetchPermits]
  );

  const endValidPermits = useCallback(
    async (permitIds, endType, iban) => {
      setStatus('loading');
      const { success } = await endPermits(permitIds, endType, iban);
      if (success) {
        await fetchPermits();
      }
    },
    [fetchPermits]
  );

  const updateVehicleReg = useCallback(
    async (permitId, registration) => {
      setStatus('loading');
      const permit = draftPermits.find(p => p.id === permitId) as Permit;
      const { success, errors, vehicle } = await updateVehicleRegistration(
        permit,
        registration
      );
      if (!success) {
        permit.vehicle.registrationNumber = '';
        onError(errors);
        return;
      }
      setDraftPermits([
        ...draftPermits.filter(p => p.id !== permitId),
        { ...permit, vehicle },
      ] as Permit[]);
      setStatus('loaded');
    },
    [draftPermits]
  );

  const createOrderRequest = useCallback(async () => {
    setStatus('loading');
    const { order } = await createOrder();
    window.open(`${order.checkoutUrl}?user=${profile?.id}`, '_self');
  }, [profile]);

  const changeAddressRequest = useCallback(
    async (addressId, iban) => {
      setStatus('loading');
      const { success } = await changeAddress(addressId, iban);
      if (success) {
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
    getAddress: () => address,
    setAddress: userAddress => setAddress(userAddress),
    getDraftPermits: () => draftPermits,
    getValidPermits: () => validPermits,
    getChangeAddressPriceChanges,
    changeAddress: (addressId, iban) => changeAddressRequest(addressId, iban),
    setStep: count => setStep(count),
    updatePermit: (payload, permitId) => updatePermit(payload, permitId),
    updateVehicle: (permitId, registration) =>
      updateVehicleReg(permitId, registration),
    deletePermit: permitId => deletePermit(permitId),
    endValidPermits: (permitIds, endType, iban) =>
      endValidPermits(permitIds, endType, iban),
    createPermit: () => createPermit(),
    createOrderRequest: () => createOrderRequest(),
    getErrorMessage: () => {
      if (!error) {
        return undefined;
      }
      return error;
    },
  } as PermitActions;
};

export default usePermitState;
