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
  ProfileActions,
  PermitEndType,
  ROUTES,
  UserProfile,
} from '../../../types';
import EndPermit from '../EndPermit';

const { PERMIT_ID, ACCOUNT_NUMBER } = vi.hoisted(() => ({
  PERMIT_ID: 'permit-1',
  ACCOUNT_NUMBER: 'FI2112345600000785',
}));
const PRICE_CHANGE = 10;
const getButton = (name: string) => screen.getByRole('button', { name });

vi.mock('../../../common/editPermits/PriceChangePreview', () => ({
  default: ({
    priceChangesList,
    onConfirm,
    onCancel,
  }: {
    priceChangesList: { priceChanges: PermitPriceChangeItem[] }[];
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
  }) => (
    <div data-testid="price-preview">
      <div>
        {priceChangesList
          .flatMap(item => item.priceChanges)
          .map(item => item.product)
          .join(', ')}
      </div>
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
  }: {
    refundTotal: number;
    refundTotalVat: number;
    onConfirm: (accountNumber: string) => void | Promise<void>;
  }) => (
    <div data-testid="refund-step">
      <div data-testid="refund-totals">
        {refundTotal}:{refundTotalVat}
      </div>
      <button onClick={() => void onConfirm(ACCOUNT_NUMBER)}>
        Confirm refund
      </button>
    </div>
  ),
}));

vi.mock('../../../common/endPermitResult/EndPermitResult', () => ({
  default: ({
    displayRefundNotification,
    email,
    endType,
  }: {
    displayRefundNotification: boolean;
    email?: string;
    endType?: string;
  }) => (
    <div
      data-testid="end-result"
      data-refund={displayRefundNotification}
      data-end-type={endType}>
      {email}
    </div>
  ),
}));

const createPriceChange = (
  amount: number,
  vatAmount: number
): PermitPriceChangeItem => ({
  product: 'Zone A',
  previousPrice: 60,
  newPrice: 60,
  priceChange: amount,
  priceChangeVat: vatAmount,
  monthCount: 2,
  startDate: '2026-01-01',
  endDate: '2026-02-01',
});

const createPermit = (overrides: Partial<Permit> = {}): Permit =>
  ({
    id: PERMIT_ID,
    contractType: ParkingContractType.FIXED_PERIOD,
    vehicle: { registrationNumber: 'ABC-123' },
    totalRefundAmount: 0,
    endingRefundLines: [],
    ...overrides,
  } as unknown as Permit);

const profile = {
  email: 'alex@example.com',
} as UserProfile;

const LocationProbe = () => {
  const { pathname, search } = useLocation();
  return <div data-testid="location">{`${pathname}${search}`}</div>;
};

const renderPage = ({
  permits = [
    createPermit({
      endingRefundLines: [createPriceChange(PRICE_CHANGE, 2)],
    }),
  ],
  endValidPermits = vi.fn().mockResolvedValue(true),
  getErrorMessage = () => 'Permit ending failed',
  endType = PermitEndType.IMMEDIATELY,
}: {
  permits?: Permit[];
  endValidPermits?: PermitActions['endValidPermits'];
  getErrorMessage?: () => string | undefined;
  endType?: PermitEndType | string;
} = {}) => {
  const permitActions = {
    getValidPermits: () => permits,
    endValidPermits,
    getErrorMessage,
  };
  const profileActions = { getProfile: () => profile };

  render(
    <MemoryRouter
      initialEntries={[
        `${ROUTES.END_PERMITS}?permitIds=${PERMIT_ID}&endType=${endType}`,
      ]}>
      <PermitStateContext.Provider
        value={permitActions as unknown as PermitActions}>
        <UserProfileContext.Provider
          value={profileActions as unknown as ProfileActions}>
          <Routes>
            <Route path={ROUTES.END_PERMITS} element={<EndPermit />} />
            <Route
              path={ROUTES.VALID_PERMITS}
              element={<div>My permits</div>}
            />
          </Routes>
          <LocationProbe />
        </UserProfileContext.Provider>
      </PermitStateContext.Provider>
    </MemoryRouter>
  );

  return { endValidPermits };
};

it('requires a refund review when a permit refund amount is unresolved', () => {
  renderPage({
    permits: [createPermit({ totalRefundAmount: null })],
  });

  expect(screen.getByText('common.refundReviewRequired')).toBeInTheDocument();
  expect(screen.queryByTestId('price-preview')).not.toBeInTheDocument();
});

it('submits the refund and shows its result after successful permit ending', async () => {
  const user = userEvent.setup();
  const { endValidPermits } = renderPage();

  await user.click(getButton('Confirm price preview'));
  expect(screen.getByTestId('refund-totals')).toHaveTextContent('20:4');

  await user.click(getButton('Confirm refund'));

  expect(endValidPermits).toHaveBeenCalledWith(
    [PERMIT_ID],
    PermitEndType.IMMEDIATELY,
    ACCOUNT_NUMBER
  );
  expect(await screen.findByTestId('end-result')).toHaveAttribute(
    'data-refund',
    'true'
  );
  expect(screen.getByTestId('end-result')).toHaveAttribute(
    'data-end-type',
    PermitEndType.IMMEDIATELY
  );
});

it('ends without requesting an account number when no refund is due', async () => {
  const user = userEvent.setup();
  const { endValidPermits } = renderPage({
    permits: [
      createPermit({
        totalRefundAmount: 0,
        endingRefundLines: [createPriceChange(0, 0)],
      }),
    ],
  });

  await user.click(getButton('Confirm price preview'));

  expect(endValidPermits).toHaveBeenCalledWith(
    [PERMIT_ID],
    PermitEndType.IMMEDIATELY,
    ''
  );
  expect(await screen.findByTestId('end-result')).toHaveAttribute(
    'data-refund',
    'false'
  );
});

it('shows an error and allows retry when ending a permit fails', async () => {
  const user = userEvent.setup();
  const endValidPermits = vi
    .fn()
    .mockResolvedValueOnce(false)
    .mockResolvedValue(true);
  renderPage({ endValidPermits });

  await user.click(getButton('Confirm price preview'));
  await user.click(getButton('Confirm refund'));
  expect(await screen.findByText('Permit ending failed')).toBeInTheDocument();

  await user.click(getButton('Confirm refund'));

  expect(await screen.findByTestId('end-result')).toBeInTheDocument();
  expect(endValidPermits).toHaveBeenCalledTimes(2);
});

it('returns to permits when the price preview is canceled', async () => {
  const user = userEvent.setup();
  renderPage();

  await user.click(getButton('Cancel price preview'));

  expect(screen.getByText('My permits')).toBeInTheDocument();
});
