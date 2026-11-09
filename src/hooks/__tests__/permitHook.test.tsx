/* eslint-disable no-magic-numbers */
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import * as gql from '../../graphql/permitGqlClient';
import {
  Permit,
  PermitStatus,
  ProfileActions,
  UserAddress,
  UserProfile,
} from '../../types';
import usePermitState from '../permitHook';
import { UserProfileContext } from '../userProfileProvider';

vi.mock('hds-react', async importOriginal => ({
  ...(await importOriginal<typeof import('hds-react')>()),
  useAuthenticatedUser: () => ({ profile: { sub: 'user-1' } }),
}));

vi.mock('../../graphql/permitGqlClient', () => ({
  changeAddress: vi.fn(),
  createDraftPermit: vi.fn(),
  createOrder: vi.fn(),
  deleteDraftPermit: vi.fn(),
  endPermits: vi.fn(),
  getAllPermits: vi.fn(),
  getChangeAddressPriceChanges: vi.fn(),
  updateDraftPermit: vi.fn(),
}));

const mocked = vi.mocked(gql);
type Hook = ReturnType<typeof usePermitState>;

const addressA = { id: 'address-1', streetName: 'Testikatu' } as UserAddress;
const addressB = { id: 'address-2', streetName: 'Testikatu' } as UserAddress;

const makePermit = (overrides: Partial<Permit> = {}) =>
  ({
    id: 'permit-1',
    status: PermitStatus.VALID,
    primaryVehicle: false,
    isOrderConfirmed: false,
    addressChanged: false,
    address: addressA,
    vehicle: { registrationNumber: 'ABC-123' },
    ...overrides,
  } as Permit);

const makeWrapper = (age = 30) => {
  const addresses = [addressA, addressB];
  const ctx = {
    getProfile: () => ({ age } as UserProfile),
    getAddresses: () => addresses,
  } as ProfileActions;
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <UserProfileContext.Provider value={ctx}>
      {children}
    </UserProfileContext.Provider>
  );
};

const setup = async (permits: Permit[] = []) => {
  mocked.getAllPermits.mockResolvedValue(permits);
  const hook = renderHook(() => usePermitState(), { wrapper: makeWrapper() });
  await waitFor(() => expect(hook.result.current.getStatus()).toBe('loaded'));
  return hook;
};

describe('usePermitState', () => {
  const openSpy = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('open', openSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('initial fetch', () => {
    it('fetches once when age limit is met and selects the first address', async () => {
      const { result } = await setup();
      expect(mocked.getAllPermits).toHaveBeenCalledTimes(1);
      expect(result.current.getPermits()).toEqual([]);
      expect(result.current.getSelectedAddress()).toBe(addressA);
    });

    it('does not fetch when under the age limit or without profile context', async () => {
      const young = renderHook(() => usePermitState(), {
        wrapper: makeWrapper(17),
      });
      const noContext = renderHook(() => usePermitState());
      await act(async () => {});
      expect(mocked.getAllPermits).not.toHaveBeenCalled();
      expect(young.result.current.getStatus()).toBe('waiting');
      expect(noContext.result.current.getStatus()).toBe('waiting');
    });

    it('selects the address of the first permit', async () => {
      const { result } = await setup([makePermit({ address: addressB })]);
      expect(result.current.getSelectedAddress()).toBe(addressB);
    });

    it('treats a null response as no permits', async () => {
      const { result } = await setup(null as unknown as Permit[]);
      expect(result.current.getPermits()).toEqual([]);
    });

    it('keeps an existing selection when no permits are returned', async () => {
      const { result } = await setup();
      act(() => result.current.setSelectedAddress(addressB));
      await act(() => result.current.fetchPermits());
      expect(result.current.getSelectedAddress()).toBe(addressB);
    });
  });

  describe('derived getters', () => {
    it('permitExists matches registration case-insensitively', async () => {
      const { result } = await setup([makePermit()]);
      expect(result.current.permitExists('abc-123')).toBe(true);
      expect(result.current.permitExists('XYZ-999')).toBe(false);
    });

    it('getDraftPermits returns drafts and preliminary permits, primary first', async () => {
      const { result } = await setup([
        makePermit({ id: 'valid', status: PermitStatus.VALID }),
        makePermit({ id: 'secondary', status: PermitStatus.DRAFT }),
        makePermit({
          id: 'primary',
          status: PermitStatus.PRELIMINARY,
          primaryVehicle: true,
        }),
      ]);
      expect(result.current.getDraftPermits().map(p => p.id)).toEqual([
        'primary',
        'secondary',
      ]);
    });

    it('getValidPermits follows validity rules and ignores non-valid address changes', async () => {
      const { result } = await setup([
        makePermit({ id: 'valid', status: PermitStatus.VALID }),
        makePermit({ id: 'paying', status: PermitStatus.PAYMENT_IN_PROGRESS }),
        makePermit({
          id: 'confirmed-draft',
          status: PermitStatus.DRAFT,
          isOrderConfirmed: true,
        }),
        makePermit({
          id: 'confirmed-prelim',
          status: PermitStatus.PRELIMINARY,
          isOrderConfirmed: true,
        }),
        makePermit({ id: 'draft', status: PermitStatus.DRAFT }),
        makePermit({
          id: 'closed',
          status: PermitStatus.CLOSED,
          addressChanged: true,
        }),
      ]);
      expect(result.current.getValidPermits().map(p => p.id)).toEqual([
        'valid',
        'paying',
        'confirmed-draft',
        'confirmed-prelim',
      ]);
      expect(result.current.permitsHaveOutdatedAddresses()).toBe(false);
    });

    it('permitsHaveOutdatedAddresses is true if any valid permit has changed address', async () => {
      const { result } = await setup([
        makePermit({ id: 'a' }),
        makePermit({ id: 'b', addressChanged: true }),
      ]);
      expect(result.current.permitsHaveOutdatedAddresses()).toBe(true);
    });

    it('permitsHaveStarted requires every permit to have a past start time', async () => {
      const { result } = await setup();
      const past = makePermit({ startTime: '2000-01-01T00:00:00Z' });
      const future = makePermit({ startTime: '2999-01-01T00:00:00Z' });
      const missing = makePermit({ startTime: undefined });
      expect(result.current.permitsHaveStarted([past])).toBe(true);
      expect(result.current.permitsHaveStarted([past, future])).toBe(false);
      expect(result.current.permitsHaveStarted([past, missing])).toBe(false);
      expect(result.current.permitsHaveStarted([])).toBe(true);
    });
  });

  describe('mutations', () => {
    it.each([
      [
        'updatePermit',
        () => mocked.updateDraftPermit,
        (r: Hook) => r.updatePermit({ id: 'x' }, 'permit-1'),
        [{ id: 'x' }, 'permit-1'],
      ],
      [
        'createPermit',
        () => mocked.createDraftPermit,
        (r: Hook) => r.createPermit('ABC-123'),
        [addressA, 'ABC-123'],
      ],
      [
        'deletePermit',
        () => mocked.deleteDraftPermit,
        (r: Hook) => r.deletePermit('permit-1'),
        ['permit-1'],
      ],
      [
        'endValidPermits',
        () => mocked.endPermits,
        (r: Hook) => r.endValidPermits(['permit-1'], 'IMMEDIATELY', 'FI00TEST'),
        [['permit-1'], 'IMMEDIATELY', 'FI00TEST'],
      ],
    ])(
      '%s calls the client, then refetches permits',
      async (_name, getClientFn, invoke, expectedArgs) => {
        const { result } = await setup();
        (getClientFn() as ReturnType<typeof vi.fn>).mockResolvedValue(
          undefined
        );
        mocked.getAllPermits.mockClear();

        act(() => {
          invoke(result.current);
        });
        expect(result.current.getStatus()).toBe('loading');
        await waitFor(() =>
          expect(mocked.getAllPermits).toHaveBeenCalledTimes(1)
        );
        expect(getClientFn()).toHaveBeenCalledWith(...expectedArgs);
        await waitFor(() => expect(result.current.getStatus()).toBe('loaded'));
      }
    );

    it('sets error state when a mutation fails and clears it on request', async () => {
      const { result } = await setup();
      mocked.deleteDraftPermit.mockRejectedValue('Test failure');

      act(() => {
        result.current.deletePermit('permit-1');
      });
      await waitFor(() => expect(result.current.getStatus()).toBe('error'));
      expect(result.current.getErrorMessage()).toBe('Test failure');

      act(() => result.current.clearErrorMessage());
      expect(result.current.getStatus()).toBe('loaded');
      expect(result.current.getErrorMessage()).toBeUndefined();
    });

    it('currently reports "loaded" with an error message when fetching permits fails', async () => {
      const { result } = await setup();
      mocked.getAllPermits.mockRejectedValue('Fetch failure');
      await act(() => result.current.fetchPermits());
      expect(result.current.getStatus()).toBe('loaded');
      expect(result.current.getErrorMessage()).toBe('Fetch failure');
    });
  });

  describe('checkout redirects', () => {
    it('createOrderRequest opens the checkout url with the user id', async () => {
      const { result } = await setup();
      mocked.createOrder.mockResolvedValue({
        checkoutUrl: 'https://example.com/pay',
      });
      await act(() => result.current.createOrderRequest());
      expect(openSpy).toHaveBeenCalledWith(
        'https://example.com/pay?user=user-1',
        '_self'
      );
    });

    it('createOrderRequest does not redirect without a checkout url', async () => {
      const { result } = await setup();
      mocked.createOrder.mockResolvedValue({} as never);
      await act(() => result.current.createOrderRequest());
      expect(openSpy).not.toHaveBeenCalled();
    });

    it('changeAddress redirects when a checkout url is returned', async () => {
      const { result } = await setup();
      mocked.changeAddress.mockResolvedValue({
        checkoutUrl: 'https://example.com/change',
      } as never);
      mocked.getAllPermits.mockClear();
      await act(() => result.current.changeAddress('address-2', 'FI00TEST'));
      expect(mocked.changeAddress).toHaveBeenCalledWith(
        'address-2',
        'FI00TEST'
      );
      expect(openSpy).toHaveBeenCalledWith(
        'https://example.com/change',
        '_self'
      );
      expect(mocked.getAllPermits).not.toHaveBeenCalled();
    });

    it('changeAddress refetches permits when there is no checkout url', async () => {
      const { result } = await setup();
      mocked.changeAddress.mockResolvedValue({ checkoutUrl: '' } as never);
      mocked.getAllPermits.mockClear();
      await act(() => result.current.changeAddress('address-2', undefined));
      expect(openSpy).not.toHaveBeenCalled();
      expect(mocked.getAllPermits).toHaveBeenCalledTimes(1);
    });
  });

  it('manages step and passes through the price change query', async () => {
    const { result } = await setup();
    expect(result.current.getStep()).toBe(0);
    act(() => result.current.setStep(2));
    expect(result.current.getStep()).toBe(2);
    expect(result.current.getChangeAddressPriceChanges).toBe(
      mocked.getChangeAddressPriceChanges
    );
  });
});
