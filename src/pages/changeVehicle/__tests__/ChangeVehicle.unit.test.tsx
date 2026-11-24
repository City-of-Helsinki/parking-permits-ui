import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import type PriceChangePreview from '../../../common/editPermits/PriceChangePreview';
import type Refund from '../../../common/editPermits/Refund';
import type VehicleDetails from '../../../common/editPermits/VehicleDetails';
import {
  getVehiclePriceChanges,
  updatePermitVehicle,
} from '../../../graphql/permitGqlClient';
import { PermitStateContext } from '../../../hooks/permitProvider';
import { VehicleChangeErrorContext } from '../../../hooks/vehicleChangeErrorProvider';
import { UserProfileContext } from '../../../hooks/userProfileProvider';
import {
  ParkingContractType,
  Permit,
  PermitActions,
  PermitPriceChangeItem,
  ProfileActions,
  ROUTES,
  UserAddress,
  UserProfile,
} from '../../../types';
import ChangeVehicle from '../ChangeVehicle';

const PERMIT_ID = 'permit-1';
const BASE_MONTHLY_PRICE = 60;
const PRICE_INCREASE = 10;
const PRICE_INCREASE_VAT = 2;
const PRICE_DECREASE = -10;
const PRICE_DECREASE_VAT = -2;

const { selectedVehicle } = vi.hoisted(() => ({
  selectedVehicle: {
    id: 'vehicle-2',
    registrationNumber: 'NEW-123',
    manufacturer: 'Toyota',
    model: 'Corolla',
    productionYear: 2020,
    updatedFromTraficomOn: null,
    isLowEmission: true,
    restrictions: [],
  },
}));

vi.mock('../../../graphql/permitGqlClient', () => ({
  getVehiclePriceChanges: vi.fn(),
  updatePermitVehicle: vi.fn(),
}));

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

vi.mock('../../../common/editPermits/VehicleDetails', () => ({
  default: ({
    vehicle,
    setVehicle,
    onContinue,
    setLowEmissionChecked,
  }: ComponentProps<typeof VehicleDetails>) => (
    <div>
      {vehicle && <div>Vehicle selected</div>}
      <button onClick={() => void setVehicle(selectedVehicle)}>
        Select vehicle
      </button>
      <button onClick={() => setLowEmissionChecked(true)}>
        Accept low-emission discount
      </button>
      <button onClick={onContinue}>Continue vehicle</button>
    </div>
  ),
}));

vi.mock('../../../common/editPermits/PriceChangePreview', () => ({
  default: ({
    isRefund,
    onConfirm,
    onCancel,
  }: ComponentProps<typeof PriceChangePreview>) => (
    <div data-testid="price-preview" data-refund={isRefund}>
      <button onClick={() => void onConfirm()}>Confirm price preview</button>
      <button onClick={onCancel}>Cancel price preview</button>
    </div>
  ),
}));

vi.mock('../../../common/editPermits/Refund', () => ({
  default: ({
    refundTotal,
    refundTotalVat,
    onConfirm,
    onCancel,
  }: ComponentProps<typeof Refund>) => (
    <div>
      <div>
        Refund: {refundTotal}, VAT: {refundTotalVat}
      </div>
      <button onClick={() => void onConfirm('FI2112345600000785')}>
        Confirm refund
      </button>
      <button onClick={onCancel}>Cancel refund</button>
    </div>
  ),
}));

vi.mock('../../../common/editPermits/OrderReview', () => ({
  default: () => <div>Order review</div>,
}));

const address: UserAddress = {
  id: 'address-1',
  streetName: 'Test Street',
  streetNameSv: 'Test Street',
  streetNumber: 1,
  city: 'Helsinki',
  citySv: 'Helsingfors',
  postalCode: '00100',
  primary: true,
};

const profile: UserProfile = {
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
  otherAddress: address,
  otherAddressApartment: '',
  otherAddressApartmentSv: '',
  token: '',
};

const createPermit = (contractType = ParkingContractType.OPEN_ENDED): Permit =>
  ({
    id: PERMIT_ID,
    contractType,
    address,
    vehicle: { id: 'vehicle-1', registrationNumber: 'OLD-123' },
  } as unknown as Permit);

const createPriceChange = (
  priceChange: number,
  priceChangeVat: number
): PermitPriceChangeItem => ({
  product: 'Zone A',
  previousPrice: BASE_MONTHLY_PRICE,
  newPrice: BASE_MONTHLY_PRICE + priceChange,
  priceChange,
  priceChangeVat,
  monthCount: 2,
  startDate: '2024-01-01',
  endDate: '2024-02-29',
});

const LocationProbe = () => {
  const { pathname, search } = useLocation();
  return <div data-testid="location">{`${pathname}${search}`}</div>;
};

const renderPage = ({
  currentPermit = createPermit(),
  currentProfile = profile,
}: {
  currentPermit?: Permit | null;
  currentProfile?: UserProfile | null;
} = {}) => {
  const fetchPermits = vi.fn().mockResolvedValue(undefined);
  const setError = vi.fn();
  const permitActions = {
    getPermits: () => (currentPermit ? [currentPermit] : []),
    fetchPermits,
  };
  const profileActions = { getProfile: () => currentProfile };

  render(
    <MemoryRouter initialEntries={[`/change/${PERMIT_ID}`]}>
      <PermitStateContext.Provider
        value={permitActions as unknown as PermitActions}>
        <UserProfileContext.Provider
          value={profileActions as unknown as ProfileActions}>
          <VehicleChangeErrorContext.Provider value={{ error: '', setError }}>
            <Routes>
              <Route path="/change/:permitId" element={<ChangeVehicle />} />
              <Route
                path={ROUTES.VALID_PERMITS}
                element={<div>My permits</div>}
              />
              <Route path={ROUTES.SUCCESS} element={<div>Success</div>} />
            </Routes>
            <LocationProbe />
          </VehicleChangeErrorContext.Provider>
        </UserProfileContext.Provider>
      </PermitStateContext.Provider>
    </MemoryRouter>
  );

  return { fetchPermits, setError };
};

const selectVehicle = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Select vehicle' }));
  await screen.findByText('Vehicle selected');
};

const getContinueVehicleButton = () =>
  screen.getByRole('button', { name: 'Continue vehicle' });

const getConfirmPricePreviewButton = () =>
  screen.getByRole('button', { name: 'Confirm price preview' });

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getVehiclePriceChanges).mockResolvedValue([
    createPriceChange(PRICE_INCREASE, PRICE_INCREASE_VAT),
  ]);
  vi.mocked(updatePermitVehicle).mockResolvedValue({ refundCreated: false });
});

it('redirects to permits when the permit is missing', async () => {
  renderPage({ currentPermit: null });

  expect(await screen.findByText('My permits')).toBeInTheDocument();
});

it('redirects to permits when the profile is missing', async () => {
  renderPage({ currentProfile: null });

  expect(await screen.findByText('My permits')).toBeInTheDocument();
});

it('submits an open-ended price increase and returns to permits', async () => {
  const user = userEvent.setup();
  const { fetchPermits } = renderPage();

  await selectVehicle(user);
  await user.click(
    screen.getByRole('button', { name: 'Accept low-emission discount' })
  );
  await user.click(getContinueVehicleButton());

  expect(getVehiclePriceChanges).toHaveBeenCalledWith(PERMIT_ID, true);
  expect(updatePermitVehicle).toHaveBeenCalledWith(
    PERMIT_ID,
    selectedVehicle.id,
    true,
    undefined
  );
  expect(fetchPermits).toHaveBeenCalledOnce();
  expect(await screen.findByText('My permits')).toBeInTheDocument();
});

it('routes a zero price change to the success page', async () => {
  const user = userEvent.setup();
  vi.mocked(getVehiclePriceChanges).mockResolvedValue([
    createPriceChange(0, 0),
  ]);
  renderPage();

  await selectVehicle(user);
  await user.click(getContinueVehicleButton());

  expect(await screen.findByText('Success')).toBeInTheDocument();
  expect(screen.getByTestId('location')).toHaveTextContent(
    `${ROUTES.SUCCESS}?permitId=${PERMIT_ID}`
  );
});

it('collects refund account details for a price decrease', async () => {
  const user = userEvent.setup();
  vi.mocked(getVehiclePriceChanges).mockResolvedValue([
    createPriceChange(PRICE_DECREASE, PRICE_DECREASE_VAT),
  ]);
  renderPage();

  await selectVehicle(user);
  await user.click(getContinueVehicleButton());
  expect(screen.getByTestId('price-preview')).toHaveAttribute(
    'data-refund',
    'true'
  );

  await user.click(getConfirmPricePreviewButton());
  expect(screen.getByText('Refund: 20, VAT: 4')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Cancel refund' }));
  expect(screen.getByTestId('price-preview')).toBeInTheDocument();
  await user.click(getConfirmPricePreviewButton());
  await user.click(screen.getByRole('button', { name: 'Confirm refund' }));

  await waitFor(() =>
    expect(updatePermitVehicle).toHaveBeenCalledWith(
      PERMIT_ID,
      selectedVehicle.id,
      false,
      'FI2112345600000785'
    )
  );
  expect(await screen.findByText('Success')).toBeInTheDocument();
});

it('reports submission failures through the vehicle change error context', async () => {
  const user = userEvent.setup();
  const { setError } = renderPage();
  vi.mocked(updatePermitVehicle).mockRejectedValue(new Error('request failed'));

  await selectVehicle(user);
  await user.click(getContinueVehicleButton());

  expect(setError).toHaveBeenCalledWith(
    'You already have valid permits for given vehicle'
  );
  expect(screen.getByTestId('location')).toHaveTextContent(
    `/change/${PERMIT_ID}`
  );
});
