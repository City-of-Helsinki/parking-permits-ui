import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import {
  getVehicleInformation,
  getVehiclePriceChanges,
  updatePermitVehicle,
} from '../../../graphql/permitGqlClient';
import { PermitStateContext } from '../../../hooks/permitProvider';
import { VehicleChangeErrorContext } from '../../../hooks/vehicleChangeErrorProvider';
import { UserProfileContext } from '../../../hooks/userProfileProvider';
import {
  ParkingContractType,
  PermitActions,
  ProfileActions,
  ROUTES,
} from '../../../types';
import ChangeVehicle from '../ChangeVehicle';

vi.mock('../../../common/parkingZoneMap/ParkingZonesMap', () => ({
  default: () => null,
}));
vi.mock('hds-react', async importOriginal => ({
  ...(await importOriginal<typeof import('hds-react')>()),
  useOidcClient: () => ({ logout: vi.fn() }),
}));

vi.mock('../../../graphql/permitGqlClient', () => ({
  getVehicleInformation: vi.fn(),
  getVehiclePriceChanges: vi.fn(),
  updatePermitVehicle: vi.fn(),
}));

async function showPriceChangePreview(lowEmission: boolean) {
  const user = userEvent.setup();
  const permit = {
    id: '1',
    contractType: ParkingContractType.FIXED_PERIOD,
    address: { streetName: 'Test', streetNumber: '1' },
    vehicle: { registrationNumber: 'OLD-123' },
  };
  const profile = {
    getProfile: () => ({ firstName: 'Alex', email: 'alex@example.com' }),
  };
  const context = {
    getPermits: () => [permit],
    permitExists: () => false,
    fetchPermits: vi.fn(async () => {
      permit.vehicle = { registrationNumber: 'ABC-123' };
    }),
  };

  vi.mocked(getVehicleInformation).mockResolvedValue({
    id: '2',
    registrationNumber: 'ABC-123',
    manufacturer: 'Make',
    model: 'Model',
    productionYear: 2020,
    updatedFromTraficomOn: null,
    isLowEmission: lowEmission,
    restrictions: [],
  });

  const fullPrice = 60;
  const discountedPrice = 30;
  const vatDifference = 6;
  const newPrice = lowEmission ? discountedPrice : fullPrice;
  const previousPrice = lowEmission ? fullPrice : discountedPrice;
  vi.mocked(getVehiclePriceChanges).mockResolvedValue([
    {
      product: 'Zone A',
      startDate: '2021-05-01',
      endDate: '2021-12-31',
      monthCount: 8,
      newPrice,
      previousPrice,
      priceChange: newPrice - previousPrice,
      priceChangeVat: lowEmission ? -vatDifference : vatDifference,
    },
  ]);
  vi.mocked(updatePermitVehicle)
    .mockReset()
    .mockResolvedValue(
      lowEmission
        ? { refundCreated: true }
        : { refundCreated: false, checkoutUrl: 'https://example.com' }
    );

  render(
    <MemoryRouter initialEntries={['/change/1']}>
      <UserProfileContext.Provider value={profile as ProfileActions}>
        <PermitStateContext.Provider
          value={context as unknown as PermitActions}>
          <VehicleChangeErrorContext.Provider
            value={{ error: '', setError: vi.fn() }}>
            <Routes>
              <Route
                path={ROUTES.VALID_PERMITS}
                element={<div>My permits</div>}
              />
              <Route path="/change/:permitId" element={<ChangeVehicle />} />
            </Routes>
          </VehicleChangeErrorContext.Provider>
        </PermitStateContext.Provider>
      </UserProfileContext.Provider>
    </MemoryRouter>
  );

  await user.type(screen.getByRole('textbox'), 'ABC-123');
  await user.click(screen.getByRole('button', { name: /changeBtn/ }));
  await user.click(
    await screen.findByRole('button', { name: /actionBtn.continue/ })
  );

  expect(getVehiclePriceChanges).toHaveBeenCalledWith('1', lowEmission);
  expect(screen.getByText(/PriceChangePreview.title/)).toBeInTheDocument();
  expect(screen.getAllByText(/240.*€/).length).toBeGreaterThan(0);
  expect(updatePermitVehicle).not.toHaveBeenCalled();

  const confirmButton = screen.getByRole('button', {
    name: /PriceChangePreview.actionBtn.continue/,
  });
  return { user, confirmButton };
}

it('submits a low-emission price decrease as a refund', async () => {
  const { user, confirmButton } = await showPriceChangePreview(true);

  await user.click(confirmButton);
  expect(screen.getByText(/Refund.title/)).toBeInTheDocument();
  expect(updatePermitVehicle).not.toHaveBeenCalled();

  const submitButton = screen.getByRole('button', {
    name: /Refund.actionBtn.continue/,
  });
  vi.mocked(updatePermitVehicle).mockRejectedValueOnce(
    new Error('network error')
  );
  await user.click(submitButton);
  expect(screen.queryByText(/pendingRefundTitle/)).not.toBeInTheDocument();
  expect(submitButton).toBeInTheDocument();

  await user.click(submitButton);
  expect(
    await screen.findByText(/OrderReview.notification.info.pendingRefundTitle/)
  ).toBeInTheDocument();
  expect(screen.getByText(/ABC-123/)).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /returnToHomePage/ }));
  expect(screen.getByText('My permits')).toBeInTheDocument();
});

it('redirects to checkout after a standard price increase', async () => {
  const { user, confirmButton } = await showPriceChangePreview(false);
  const open = vi.spyOn(window, 'open').mockImplementation(() => null);

  try {
    const pending =
      Promise.withResolvers<Awaited<ReturnType<typeof updatePermitVehicle>>>();
    vi.mocked(updatePermitVehicle).mockReturnValueOnce(pending.promise);

    await user.dblClick(confirmButton);
    expect(confirmButton).toBeDisabled();
    expect(
      screen.getByRole('button', {
        name: /PriceChangePreview.actionBtn.cancel/,
      })
    ).toBeDisabled();
    expect(updatePermitVehicle).toHaveBeenCalledTimes(1);
    expect(open).not.toHaveBeenCalled();

    await act(async () =>
      pending.resolve({
        refundCreated: false,
        checkoutUrl: 'https://example.com',
      })
    );
    await waitFor(() =>
      expect(open).toHaveBeenCalledWith('https://example.com', '_self')
    );
  } finally {
    open.mockRestore();
  }
});
