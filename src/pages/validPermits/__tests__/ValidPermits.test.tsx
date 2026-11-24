import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { PermitStateContext } from '../../../hooks/permitProvider';
import { UserProfileContext } from '../../../hooks/userProfileProvider';
import {
  ParkingContractType,
  Permit,
  PermitActions,
  PermitEndType,
  PermitStatus,
  ProfileActions,
  ROUTES,
  UserAddress,
  UserProfile,
} from '../../../types';
import ValidPermits from '../ValidPermits';

vi.mock('react-i18next', async importOriginal => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  const { createEnglishReactI18nextMock } = await import(
    '../../../__tests__/i18n'
  );
  return {
    ...actual,
    ...(await createEnglishReactI18nextMock()),
  };
});

vi.mock('../../../hooks/usePurchaseTime', () => ({
  default: () => [new Date('2026-01-01T12:00:00'), vi.fn()],
}));

vi.mock('../../../common/permit/Permit', () => ({
  default: ({ permits }: { permits: Permit[] }) => (
    <div data-testid="permit-list">{permits.length}</div>
  ),
}));

vi.mock('../../../common/purchaseNotification/PurchaseNotification', () => ({
  default: () => <div>Purchase pending</div>,
}));

vi.mock('../../../common/endPermitDialog/EndPermitDialog', async () => {
  const { PermitEndType } = await import('../../../types');

  return {
    default: ({
      isOpen,
      onConfirm,
    }: {
      isOpen: boolean;
      onConfirm: (endType: string) => void;
    }) =>
      isOpen ? (
        <div role="dialog">
          <button onClick={() => onConfirm(PermitEndType.AFTER_CURRENT_PERIOD)}>
            End after current period
          </button>
        </div>
      ) : null,
  };
});

const address = { id: 'address-1', zone: { name: 'Zone A' } } as UserAddress;

const createProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: 'profile-1',
  age: 30,
  email: 'alex@example.com',
  firstName: 'Alex',
  lastName: 'Example',
  language: 'fi',
  phoneNumber: '',
  primaryAddress: address,
  primaryAddressApartment: '',
  primaryAddressApartmentSv: '',
  otherAddress: { ...address, id: 'address-2' },
  otherAddressApartment: '',
  otherAddressApartmentSv: '',
  token: '',
  ...overrides,
});

const createPermit = (overrides: Partial<Permit> = {}): Permit =>
  ({
    id: 'permit-1',
    talpaOrderId: '',
    status: PermitStatus.VALID,
    primaryVehicle: false,
    contractType: ParkingContractType.FIXED_PERIOD,
    startTime: '2025-01-01T12:00:00',
    endTime: '2027-01-01T12:00:00',
    currentPeriodEndTime: '2027-01-01T12:00:00',
    canEndAfterCurrentPeriod: false,
    activeTemporaryVehicle: undefined,
    vehicleChanged: false,
    vehicle: { registrationNumber: 'ABC-123' },
    address,
    ...overrides,
  } as unknown as Permit);

const LocationProbe = () => {
  const { pathname, search } = useLocation();
  return <div data-testid="location">{`${pathname}${search}`}</div>;
};

const getButton = (name: string) => screen.getByRole('button', { name });
const getLocation = () => screen.getByTestId('location');

const renderPage = ({
  permits = [createPermit()],
  profile = createProfile(),
  outdatedAddresses = false,
  permitsHaveStarted = true,
}: {
  permits?: Permit[];
  profile?: UserProfile | null;
  outdatedAddresses?: boolean;
  permitsHaveStarted?: boolean;
} = {}) => {
  const permitActions = {
    getValidPermits: () => permits,
    permitsHaveOutdatedAddresses: () => outdatedAddresses,
    permitsHaveStarted: () => permitsHaveStarted,
  };
  const profileActions = { getProfile: () => profile };

  return render(
    <MemoryRouter initialEntries={[ROUTES.VALID_PERMITS]}>
      <PermitStateContext.Provider
        value={permitActions as unknown as PermitActions}>
        <UserProfileContext.Provider
          value={profileActions as unknown as ProfileActions}>
          <Routes>
            <Route path={ROUTES.VALID_PERMITS} element={<ValidPermits />} />
            <Route path={ROUTES.BASE} element={<div>Base page</div>} />
            <Route
              path={ROUTES.PERMIT_PRICES}
              element={<div>Permit prices</div>}
            />
            <Route path={ROUTES.END_PERMITS} element={<div>End permits</div>} />
          </Routes>
          <LocationProbe />
        </UserProfileContext.Provider>
      </PermitStateContext.Provider>
    </MemoryRouter>
  );
};

it('redirects to the base route if the profile or permits are missing', async () => {
  const { unmount } = renderPage({ profile: null });
  expect(await screen.findByText('Base page')).toBeInTheDocument();
  unmount();

  renderPage({ permits: [] });
  expect(await screen.findByText('Base page')).toBeInTheDocument();
});

it('shows permit notices for pending orders, vehicle changes, and addresses', () => {
  renderPage({
    permits: [
      createPermit({
        status: PermitStatus.DRAFT,
        talpaOrderId: 'order-1',
        isOrderConfirmed: true,
        hasPendingExtensionRequest: true,
        vehicleChanged: true,
      }),
    ],
    outdatedAddresses: true,
    permitsHaveStarted: false,
  });

  expect(screen.getByText('Purchase pending')).toBeInTheDocument();
  expect(screen.getByText('Permit not yet active')).toBeInTheDocument();
  expect(screen.getByText('Change in vehicle information')).toBeInTheDocument();
  expect(screen.getByText('Change of user address')).toBeInTheDocument();
  expect(
    screen.getByText('Your parking permit will expire')
  ).toBeInTheDocument();
  expect(getButton('Terminate parking permits')).toBeDisabled();
});

it('shows the no-valid-address notice', () => {
  const noZoneAddress = { id: 'address-no-zone' } as UserAddress;
  renderPage({
    profile: createProfile({
      primaryAddress: noZoneAddress,
      otherAddress: noZoneAddress,
    }),
  });

  expect(screen.getByText('Change of user address')).toBeInTheDocument();
});

it('navigates to permit prices when ordering a second permit', async () => {
  const user = userEvent.setup();
  renderPage();

  await user.click(getButton('Add another vehicle'));

  expect(screen.getByText('Permit prices')).toBeInTheDocument();
});

it('deletes a permit immediately when ending after the period is unavailable', async () => {
  const user = userEvent.setup();
  renderPage({ permits: [createPermit({ canEndAfterCurrentPeriod: false })] });

  await user.click(getButton('Terminate parking permits'));

  expect(screen.getByText('End permits')).toBeInTheDocument();
  expect(getLocation()).toHaveTextContent(
    `${ROUTES.END_PERMITS}?permitIds=permit-1&endType=${PermitEndType.IMMEDIATELY}`
  );
});

it('offers a delayed permit end when allowed', async () => {
  const user = userEvent.setup();
  renderPage({
    permits: [
      createPermit({
        canEndAfterCurrentPeriod: true,
        startTime: '2020-01-01T12:00:00',
      }),
    ],
  });

  await user.click(getButton('Terminate parking permits'));
  expect(screen.getByRole('dialog')).toBeInTheDocument();

  await user.click(getButton('End after current period'));

  expect(getLocation()).toHaveTextContent(
    `${ROUTES.END_PERMITS}?permitIds=permit-1&endType=${PermitEndType.AFTER_CURRENT_PERIOD}`
  );
});

it('locks permit actions while a temporary vehicle is active', () => {
  renderPage({
    permits: [
      createPermit({
        activeTemporaryVehicle: {} as Permit['activeTemporaryVehicle'],
      }),
    ],
  });

  expect(getButton('Add another vehicle')).toBeDisabled();
  expect(getButton('Terminate parking permits')).toBeDisabled();
});
