import type { ReactNode } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { PermitStateContext } from '../hooks/permitProvider';
import { UserProfileContext } from '../hooks/userProfileProvider';
import { VehicleChangeErrorContext } from '../hooks/vehicleChangeErrorProvider';
import { ParkingContractType, PermitActions, ProfileActions } from '../types';
import ChangeAddress from './changeAddress/ChangeAddress';
import EndPermit from './endPermit/EndPermit';

vi.mock('../common/parkingZoneMap/ParkingZonesMap', () => ({
  default: () => null,
}));
vi.mock('hds-react', async importOriginal => ({
  ...(await importOriginal<typeof import('hds-react')>()),
  useOidcClient: () => ({ logout: vi.fn() }),
}));

function renderSummaryForSubmission(page: ReactNode) {
  const pending = Promise.withResolvers<boolean>();
  const submit = vi
    .fn()
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValue(true);
  const address = { id: 'old', zone: { name: 'A' } };
  const permit = {
    id: '1',
    address,
    contractType: ParkingContractType.FIXED_PERIOD,
    endingRefundLines: [],
    vehicle: { registrationNumber: 'ABC-123' },
  };
  const permits = {
    getValidPermits: () => [permit],
    permitsHaveOutdatedAddresses: () => false,
    getChangeAddressPriceChanges: async () => [{ permit, priceChanges: [] }],
    changeAddress: submit,
    endValidPermits: submit,
    getErrorMessage: () => undefined,
  };
  const profile = {
    getProfile: () => ({
      primaryAddress: address,
      otherAddress: { ...address, id: 'new' },
    }),
  };

  render(
    <MemoryRouter initialEntries={['/?permitIds=1&endType=IMMEDIATELY']}>
      <UserProfileContext.Provider value={profile as unknown as ProfileActions}>
        <PermitStateContext.Provider
          value={permits as unknown as PermitActions}>
          <VehicleChangeErrorContext.Provider
            value={{ error: '', setError: vi.fn() }}>
            {page}
          </VehicleChangeErrorContext.Provider>
        </PermitStateContext.Provider>
      </UserProfileContext.Provider>
    </MemoryRouter>
  );

  return { pending, submit };
}

async function assertSummarySubmissionCanBeRetried({
  user,
  submit,
  settleFirstSubmission,
  resultMessage,
}: {
  user: ReturnType<typeof userEvent.setup>;
  submit: ReturnType<typeof renderSummaryForSubmission>['submit'];
  settleFirstSubmission: () => void;
  resultMessage: RegExp;
}) {
  const confirm = screen.getByRole('button', {
    name: /PriceChangePreview.actionBtn.continue/,
  });
  const cancel = screen.getByRole('button', {
    name: /PriceChangePreview.actionBtn.cancel/,
  });

  await user.dblClick(confirm);
  expect(confirm).toBeDisabled();
  expect(cancel).toBeDisabled();
  expect(screen.getByRole('status')).toHaveTextContent(
    'PriceChangePreview.loading'
  );
  await user.click(cancel);
  expect(submit).toHaveBeenCalledTimes(1);

  await act(async () => settleFirstSubmission());
  expect(confirm).toBeEnabled();
  expect(cancel).toBeEnabled();

  await user.click(confirm);
  expect(submit).toHaveBeenCalledTimes(2);
  expect(
    screen.queryByText(/PriceChangePreview.title/)
  ).not.toBeInTheDocument();
  expect(screen.getByText(resultMessage)).toBeInTheDocument();
}

it('locks the address change summary and allows retry after failure', async () => {
  const user = userEvent.setup();
  const { pending, submit } = renderSummaryForSubmission(<ChangeAddress />);

  await user.click(
    screen.getByRole('button', { name: /ChangeAddress.actionBtn.continue/ })
  );

  await assertSummarySubmissionCanBeRetried({
    user,
    submit,
    settleFirstSubmission: () => pending.reject(new Error('request failed')),
    resultMessage: /orderSuccessTitle/,
  });
});

it('locks the permit ending summary and allows retry after failure', async () => {
  const user = userEvent.setup();
  const { pending, submit } = renderSummaryForSubmission(<EndPermit />);

  await assertSummarySubmissionCanBeRetried({
    user,
    submit,
    settleFirstSubmission: () => pending.resolve(false),
    resultMessage: /EndPermitResult.notification.first.message/,
  });
});

it('shows the prepaid refund on both steps after a catalogue price change', async () => {
  const user = userEvent.setup();
  const permit = {
    id: '1',
    contractType: ParkingContractType.FIXED_PERIOD,
    vehicle: { registrationNumber: 'ABC-123' },
    currentPeriodEndTime: '2021-04-30',
    canBeRefunded: true,
    totalRefundAmount: 480,
    products: [
      {
        name: 'Replacement product',
        unitPrice: 70,
        startDate: '2021-10-01',
        endDate: '2021-12-31',
      },
    ],
    endingRefundLines: [
      {
        product: 'Purchased product',
        previousPrice: 60,
        newPrice: 60,
        priceChange: 60,
        priceChangeVat: 12,
        monthCount: 8,
        startDate: '2021-05-01',
        endDate: '2021-12-31',
      },
    ],
  };
  const permits = {
    getValidPermits: () => [permit],
    endValidPermits: vi.fn().mockResolvedValue(true),
  };

  render(
    <MemoryRouter initialEntries={['/?permitIds=1&endType=IMMEDIATELY']}>
      <PermitStateContext.Provider value={permits as unknown as PermitActions}>
        <VehicleChangeErrorContext.Provider
          value={{ error: '', setError: vi.fn() }}>
          <EndPermit />
        </VehicleChangeErrorContext.Provider>
      </PermitStateContext.Provider>
    </MemoryRouter>
  );

  expect(screen.getByText('Purchased product')).toBeInTheDocument();
  expect(screen.queryByText('Replacement product')).not.toBeInTheDocument();
  expect(screen.getAllByText('480.00 €')).toHaveLength(2);

  await user.click(
    screen.getByRole('button', {
      name: /PriceChangePreview.actionBtn.continue/,
    })
  );
  expect(screen.getByText('480.00 €')).toBeInTheDocument();
  expect(screen.getByText('96.00 €')).toBeInTheDocument();
});

it('directs an unresolved refund to customer service before submission', () => {
  const permits = {
    getValidPermits: () => [{ id: '1', totalRefundAmount: null }],
  };
  render(
    <MemoryRouter initialEntries={['/?permitIds=1&endType=IMMEDIATELY']}>
      <PermitStateContext.Provider value={permits as unknown as PermitActions}>
        <EndPermit />
      </PermitStateContext.Provider>
    </MemoryRouter>
  );
  expect(screen.getByText('common.refundReviewRequired')).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /continue/ })
  ).not.toBeInTheDocument();
});
