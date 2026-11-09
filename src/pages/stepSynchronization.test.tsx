import { act, render, screen } from '@testing-library/react';
import React, { Profiler } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { FetchStatus } from '../client/types';
import { PermitStateContext } from '../hooks/permitProvider';
import { UserProfileContext } from '../hooks/userProfileProvider';
import {
  ParkingContractType,
  Permit,
  PermitActions,
  PermitStatus,
  ProfileActions,
  ROUTES,
  STEPPER,
  UserAddress,
  UserProfile,
} from '../types';
import AddressSelector from './addressSelector/AddressSelector';
import DurationSelector from './durationSelector/DurationSelector';
import PermitPrices from './permitPrices/PermitPrices';
import PurchasedOverview from './purchasedOverview/PurchasedOverview';

let mockAuthenticated = true;

vi.mock('hds-react', async importOriginal => ({
  ...(await importOriginal<typeof import('hds-react')>()),
  useOidcClient: () => ({
    isAuthenticated: () => mockAuthenticated,
    logout: vi.fn(),
  }),
}));

vi.mock('../common/permitType/PermitType', () => ({ default: () => null }));

const address: UserAddress = {
  id: 'address-1',
  streetName: 'Testikatu',
  streetNameSv: 'Testgatan',
  streetNumber: 1,
  city: 'Helsinki',
  citySv: 'Helsingfors',
  postalCode: '00100',
  primary: true,
};

const vehicle = {
  id: 'vehicle-1',
  registrationNumber: 'ABC-123',
  manufacturer: 'Test',
  model: 'Car',
  productionYear: 2020,
  isLowEmission: false,
  updatedFromTraficomOn: null,
  restrictions: [],
};

const draftPermit: Permit = {
  id: 'permit-1',
  talpaOrderId: '',
  receiptUrl: '',
  checkoutUrl: '',
  updateCardUrl: '',
  status: PermitStatus.DRAFT,
  contractType: ParkingContractType.OPEN_ENDED,
  primaryVehicle: true,
  consentLowEmissionAccepted: false,
  products: [],
  vehicle,
  activeTemporaryVehicle: {
    id: 'temporary-vehicle-1',
    vehicle,
    startTime: null,
    endTime: null,
    isActive: false,
  },
  temporaryVehicles: [],
  monthCount: 1,
  parkingZone: {
    id: 'zone-1',
    name: 'A',
    price: 30,
    description: '',
    descriptionSv: '',
    location: { type: 'FeatureCollection', features: [] },
  },
  monthsLeft: 1,
  totalRefundAmount: 0,
  currentPeriodEndTime: '2026-12-01',
  canEndImmediately: false,
  canExtendPermit: false,
  maxExtensionMonthCount: 0,
  hasPendingExtensionRequest: false,
  hasRefund: false,
  monthlyPrice: 30,
  canBeRefunded: false,
  canEndAfterCurrentPeriod: false,
  vehicleChanged: false,
  addressChanged: false,
  isOrderConfirmed: false,
  address,
  addressApartment: '',
  addressApartmentSv: '',
};

const createPermitContext = () => ({
  getStep: vi.fn<() => number>(() => STEPPER.VALID_PERMITS),
  setStep: vi.fn(),
  getSelectedAddress: vi.fn<() => UserAddress | undefined>(() => address),
  getPermits: vi.fn(() => [] as Permit[]),
  getDraftPermits: vi.fn(() => [] as Permit[]),
  getValidPermits: vi.fn(() => [] as Permit[]),
  getStatus: vi.fn<() => FetchStatus>(() => 'loaded'),
});

const createProfileContext = () =>
  ({
    getProfile: () => ({ firstName: 'Test' } as UserProfile),
  } as ProfileActions);

const pageTree = (
  Page: React.ComponentType,
  permitContext: ReturnType<typeof createPermitContext> | null,
  profileContext: ProfileActions | null = createProfileContext()
) => (
  <MemoryRouter initialEntries={['/test-page']}>
    <PermitStateContext.Provider value={permitContext as PermitActions | null}>
      <UserProfileContext.Provider value={profileContext}>
        <Routes>
          <Route path="/test-page" element={<Page />} />
          <Route path={ROUTES.BASE} element={<div>Base destination</div>} />
          <Route
            path={ROUTES.ADDRESS}
            element={<div>Address destination</div>}
          />
          <Route
            path={ROUTES.LANDING}
            element={<div>Landing destination</div>}
          />
          <Route
            path={ROUTES.PERMIT_PRICES}
            element={<div>Prices destination</div>}
          />
        </Routes>
      </UserProfileContext.Provider>
    </PermitStateContext.Provider>
  </MemoryRouter>
);

beforeEach(() => {
  vi.useFakeTimers();
  mockAuthenticated = true;
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe.each([
  { name: 'address', Page: AddressSelector, step: STEPPER.ADDRESS_SELECTOR },
  { name: 'prices', Page: PermitPrices, step: STEPPER.PERMIT_PRICES },
  { name: 'duration', Page: DurationSelector, step: STEPPER.DURATION_SELECTOR },
  { name: 'purchase', Page: PurchasedOverview, step: STEPPER.PURCHASED_VIEW },
])('$name step synchronization', ({ Page, step }) => {
  const setupContext = () => {
    const context = createPermitContext();
    if (Page === DurationSelector) {
      context.getDraftPermits.mockReturnValue([draftPermit]);
    }
    return context;
  };

  it('updates immediately after commit, not during render or after a delay', () => {
    const context = setupContext();
    const onCommit = vi.fn();
    context.setStep.mockImplementation(() => {
      expect(onCommit).toHaveBeenCalled();
    });

    render(
      <Profiler id="page" onRender={onCommit}>
        {pageTree(Page, context)}
      </Profiler>
    );

    expect(context.setStep).toHaveBeenCalledTimes(1);
    expect(context.setStep).toHaveBeenCalledWith(step);
  });

  it('does not update a step that is already synchronized', () => {
    const context = setupContext();
    context.getStep.mockReturnValue(step);
    const { rerender } = render(pageTree(Page, context));

    rerender(pageTree(Page, { ...context }));

    expect(context.setStep).not.toHaveBeenCalled();
  });

  it('resynchronizes when the current step changes without repeating the update', () => {
    const context = setupContext();
    context.getStep.mockReturnValue(step);
    const { rerender } = render(pageTree(Page, context));

    context.getStep.mockReturnValue(STEPPER.VALID_PERMITS);
    rerender(pageTree(Page, { ...context }));

    expect(context.setStep).toHaveBeenCalledTimes(1);
    expect(context.setStep).toHaveBeenCalledWith(step);

    context.getStep.mockReturnValue(step);
    rerender(pageTree(Page, { ...context }));

    expect(context.setStep).toHaveBeenCalledTimes(1);
  });

  it('does not leave a delayed step update after unmount', () => {
    const context = setupContext();
    const { unmount } = render(pageTree(Page, context));
    context.setStep.mockClear();

    unmount();
    act(() => vi.runOnlyPendingTimers());

    expect(context.setStep).not.toHaveBeenCalled();
  });
});

it('waits for the profile context before synchronizing the address step', () => {
  const context = createPermitContext();
  const { rerender } = render(pageTree(AddressSelector, context, null));

  expect(context.setStep).not.toHaveBeenCalled();

  rerender(pageTree(AddressSelector, context, createProfileContext()));

  expect(context.setStep).toHaveBeenCalledWith(STEPPER.ADDRESS_SELECTOR);
});

it('waits for the permit context before synchronizing the address step', () => {
  const context = createPermitContext();
  const { rerender } = render(pageTree(AddressSelector, null));

  rerender(pageTree(AddressSelector, context));

  expect(context.setStep).toHaveBeenCalledTimes(1);
  expect(context.setStep).toHaveBeenCalledWith(STEPPER.ADDRESS_SELECTOR);
});

it('redirects a duration page without an address without changing its step', () => {
  const context = createPermitContext();
  context.getSelectedAddress.mockReturnValue(undefined);

  render(pageTree(DurationSelector, context));

  expect(screen.getByText('Address destination')).toBeInTheDocument();
  expect(context.setStep).not.toHaveBeenCalled();
});

it('redirects an unauthenticated purchase without changing its step', () => {
  const context = createPermitContext();
  mockAuthenticated = false;

  render(pageTree(PurchasedOverview, context));

  expect(screen.getByText('Landing destination')).toBeInTheDocument();
  expect(context.setStep).not.toHaveBeenCalled();
});

it('waits for permits to load before synchronizing the purchase step', () => {
  const context = createPermitContext();
  context.getStatus.mockReturnValue('loading');
  const { rerender } = render(pageTree(PurchasedOverview, context));

  expect(context.setStep).not.toHaveBeenCalled();

  context.getStatus.mockReturnValue('loaded');
  rerender(pageTree(PurchasedOverview, { ...context }));

  expect(context.setStep).toHaveBeenCalledTimes(1);
  expect(context.setStep).toHaveBeenCalledWith(STEPPER.PURCHASED_VIEW);
});
