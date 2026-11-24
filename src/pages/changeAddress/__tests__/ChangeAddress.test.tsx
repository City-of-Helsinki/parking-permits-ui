import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { PermitStateContext } from '../../../hooks/permitProvider';
import { UserProfileContext } from '../../../hooks/userProfileProvider';
import {
  ParkingContractType,
  Permit,
  PermitActions,
  PermitPriceChangeItem,
  PermitPriceChanges,
  ProfileActions,
  ROUTES,
  UserAddress,
  UserProfile,
} from '../../../types';
import ChangeAddress from '../ChangeAddress';

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

const BASE_PRICE = 60;
const PRICE_INCREASE = 10;
const PRICE_INCREASE_VAT = 2;
const PRICE_DECREASE = -10;
const PRICE_DECREASE_VAT = -2;

vi.mock('../../../common/address/Address', () => ({
  default: ({
    address,
    setSelectedAddress,
  }: {
    address: UserAddress;
    setSelectedAddress?: (address: UserAddress) => void;
  }) => (
    <button onClick={() => setSelectedAddress?.(address)}>
      Select {address.id}
    </button>
  ),
}));

vi.mock('../../../common/editPermits/PriceChangePreview', () => ({
  default: ({
    isRefund,
    onConfirm,
    onCancel,
  }: {
    isRefund?: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
  }) => (
    <div data-testid="price-preview" data-refund={isRefund}>
      <button onClick={() => void onConfirm()}>Confirm preview</button>
      <button onClick={onCancel}>Cancel preview</button>
    </div>
  ),
}));

vi.mock('../../../common/editPermits/Refund', () => ({
  default: ({
    refundTotal,
    refundTotalVat,
    onConfirm,
  }: {
    refundTotal: number;
    refundTotalVat: number;
    onConfirm: (accountNumber: string) => void | Promise<void>;
  }) => (
    <div>
      <div>
        Refund: {refundTotal}, VAT: {refundTotalVat}
      </div>
      <button onClick={() => void onConfirm('FI2112345600000785')}>
        Confirm refund
      </button>
    </div>
  ),
}));

vi.mock('../../../common/editPermits/OrderReview', () => ({
  default: ({ hasRefundCreated }: { hasRefundCreated?: boolean }) => (
    <div>Order review: {hasRefundCreated ? 'refund' : 'order'}</div>
  ),
}));

const createAddress = (id: string, hasZone = true): UserAddress =>
  ({
    id,
    streetName: 'Test Street',
    streetNameSv: 'Test Street',
    streetNumber: 1,
    city: 'Helsinki',
    citySv: 'Helsingfors',
    postalCode: '00100',
    primary: false,
    zone: hasZone ? { name: 'Zone A' } : undefined,
  } as UserAddress);

const currentAddress = createAddress('current');
const primaryAddress = createAddress('address-primary');
const otherAddress = createAddress('address-other');

const profile: UserProfile = {
  id: 'profile-1',
  age: 30,
  email: 'alex@example.com',
  firstName: 'Alex',
  lastName: 'Example',
  language: 'fi',
  phoneNumber: '',
  primaryAddress,
  primaryAddressApartment: '',
  primaryAddressApartmentSv: '',
  otherAddress,
  otherAddressApartment: '',
  otherAddressApartmentSv: '',
  token: '',
};

const createPermit = (overrides: Partial<Permit> = {}): Permit =>
  ({
    id: 'permit-1',
    address: currentAddress,
    contractType: ParkingContractType.FIXED_PERIOD,
    vehicle: { registrationNumber: 'ABC-123' },
    ...overrides,
  } as unknown as Permit);

const createPriceChange = (
  amount: number,
  vatAmount: number
): PermitPriceChangeItem => ({
  product: 'Zone A',
  previousPrice: BASE_PRICE,
  newPrice: BASE_PRICE + amount,
  priceChange: amount,
  priceChangeVat: vatAmount,
  monthCount: 2,
  startDate: '2026-01-01',
  endDate: '2026-02-01',
});

const createPriceChanges = (
  amount: number,
  vatAmount: number
): PermitPriceChanges[] => [
  { priceChanges: [createPriceChange(amount, vatAmount)] },
];

const LocationText = () => {
  const { pathname, search } = useLocation();
  return <div data-testid="location">{`${pathname}${search}`}</div>;
};

const getButton = (name: string) => screen.getByRole('button', { name });

const clickButton = (user: ReturnType<typeof userEvent.setup>, name: string) =>
  user.click(getButton(name));

const renderPage = ({
  permits = [createPermit()],
  currentProfile = profile,
  outdatedAddresses = false,
  priceChangesList = createPriceChanges(PRICE_INCREASE, PRICE_INCREASE_VAT),
  getPriceChanges = vi.fn().mockResolvedValue(priceChangesList),
  changeAddress = vi.fn().mockResolvedValue(undefined),
}: {
  permits?: Permit[];
  currentProfile?: UserProfile | null;
  outdatedAddresses?: boolean;
  priceChangesList?: PermitPriceChanges[];
  getPriceChanges?: (addressId: string) => Promise<PermitPriceChanges[]>;
  changeAddress?: (addressId: string, iban?: string) => Promise<void>;
} = {}) => {
  const permitActions = {
    getValidPermits: () => permits,
    permitsHaveOutdatedAddresses: () => outdatedAddresses,
    getChangeAddressPriceChanges: getPriceChanges,
    changeAddress,
  };
  const profileActions = { getProfile: () => currentProfile };

  const result = render(
    <MemoryRouter initialEntries={['/change-address']}>
      <PermitStateContext.Provider
        value={permitActions as unknown as PermitActions}>
        <UserProfileContext.Provider
          value={profileActions as unknown as ProfileActions}>
          <Routes>
            <Route path="/change-address" element={<ChangeAddress />} />
            <Route path={ROUTES.BASE} element={<div>Base page</div>} />
            <Route
              path={ROUTES.VALID_PERMITS}
              element={<div>My permits</div>}
            />
          </Routes>
          <LocationText />
        </UserProfileContext.Provider>
      </PermitStateContext.Provider>
    </MemoryRouter>
  );

  return { ...result, changeAddress, getPriceChanges };
};

const selectOtherAddress = async (user: ReturnType<typeof userEvent.setup>) => {
  await clickButton(user, 'Select address-other');
};

it('redirects to the base page without a profile or valid permits', async () => {
  const { unmount } = renderPage({ currentProfile: null });
  expect(await screen.findByText('Base page')).toBeInTheDocument();
  unmount();

  renderPage({ permits: [] });
  expect(await screen.findByText('Base page')).toBeInTheDocument();
});

it('requires a different valid address unless the change is forced', async () => {
  const user = userEvent.setup();
  renderPage({
    currentProfile: { ...profile, otherAddress: createAddress('other', false) },
  });

  expect(
    screen.getByText(
      'Both primary and secondary address belong to the same zone'
    )
  ).toBeInTheDocument();
  await clickButton(user, 'Cancel');
  expect(screen.getByText('My permits')).toBeInTheDocument();
});

it('requires an address selection before requesting price changes', async () => {
  const user = userEvent.setup();
  const { getPriceChanges } = renderPage();

  await clickButton(user, 'Continue');

  expect(getPriceChanges).not.toHaveBeenCalled();
  expect(
    screen.getByText('Choose the address for the parking permit.')
  ).toBeInTheDocument();
});

it('previews a price increase and updates the address on confirmation', async () => {
  const user = userEvent.setup();
  const { changeAddress, getPriceChanges } = renderPage();

  await selectOtherAddress(user);
  await clickButton(user, 'Continue');
  expect(await screen.findByTestId('price-preview')).toHaveAttribute(
    'data-refund',
    'false'
  );
  expect(getPriceChanges).toHaveBeenCalledWith('address-other');

  await clickButton(user, 'Confirm preview');

  expect(changeAddress).toHaveBeenCalledWith('address-other');
  expect(await screen.findByText('Order review: order')).toBeInTheDocument();
});

it('moves a price decrease to refund and submits the account number', async () => {
  const user = userEvent.setup();
  const { changeAddress } = renderPage({
    priceChangesList: createPriceChanges(PRICE_DECREASE, PRICE_DECREASE_VAT),
  });

  await selectOtherAddress(user);
  await clickButton(user, 'Continue');
  expect(await screen.findByTestId('price-preview')).toHaveAttribute(
    'data-refund',
    'true'
  );

  await clickButton(user, 'Confirm preview');
  expect(screen.getByText('Refund: 20, VAT: 4')).toBeInTheDocument();
  await clickButton(user, 'Confirm refund');

  expect(changeAddress).toHaveBeenCalledWith(
    'address-other',
    'FI2112345600000785'
  );
  expect(await screen.findByText('Order review: refund')).toBeInTheDocument();
});

it('updates an open-ended permit directly after fetching price changes', async () => {
  const user = userEvent.setup();
  const { changeAddress } = renderPage({
    permits: [createPermit({ contractType: ParkingContractType.OPEN_ENDED })],
  });

  await selectOtherAddress(user);
  await clickButton(user, 'Continue');

  expect(changeAddress).toHaveBeenCalledWith('address-other');
  expect(await screen.findByText('Order review: order')).toBeInTheDocument();
  expect(screen.queryByTestId('price-preview')).not.toBeInTheDocument();
});
