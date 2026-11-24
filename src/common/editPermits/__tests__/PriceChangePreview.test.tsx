import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VehicleChangeErrorContext } from '../../../hooks/vehicleChangeErrorProvider';
import {
  PermitPriceChangeItem,
  PermitPriceChanges,
  Vehicle,
} from '../../../types/permits';
import PriceChangePreview, {
  PriceChangePreviewProps,
} from '../PriceChangePreview';

vi.mock('react-i18next', async () => {
  const { createEnglishReactI18nextMock } = await import(
    '../../../__tests__/i18n'
  );
  return createEnglishReactI18nextMock();
});

const vehicle: Vehicle = {
  id: 'vehicle-1',
  registrationNumber: 'ABC-123',
  manufacturer: 'Toyota',
  model: 'Corolla',
  productionYear: 2020,
  updatedFromTraficomOn: '2024-01-02T00:00:00.000Z',
  isLowEmission: false,
  restrictions: [],
};

const createPriceChange = (
  overrides: Partial<PermitPriceChangeItem> = {}
): PermitPriceChangeItem => ({
  product: 'Zone A',
  newPrice: 70,
  previousPrice: 60,
  priceChange: 10,
  priceChangeVat: 2,
  monthCount: 2,
  startDate: '2024-01-01',
  endDate: '2024-02-29',
  ...overrides,
});

const createPriceChanges = (
  priceChange: PermitPriceChangeItem = createPriceChange()
): PermitPriceChanges[] => [
  {
    permit: { id: 'permit-1', vehicle },
    priceChanges: [priceChange],
  },
];

const createPriceDecrease = () =>
  createPriceChanges(
    createPriceChange({
      newPrice: 50,
      priceChange: -10,
      priceChangeVat: -2,
    })
  );

const renderPreview = ({
  error = '',
  priceChangesList = createPriceChanges(),
  onConfirm = vi.fn(),
  onCancel = vi.fn(),
  ...props
}: Partial<PriceChangePreviewProps> & { error?: string } = {}) => {
  render(
    <VehicleChangeErrorContext.Provider value={{ error, setError: vi.fn() }}>
      <PriceChangePreview
        {...props}
        priceChangesList={priceChangesList}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </VehicleChangeErrorContext.Provider>
  );
};

const getActionButtons = () => ({
  confirm: screen.getByRole('button', { name: 'Continue' }),
  cancel: screen.getByRole('button', { name: 'Cancel' }),
});

it('renders price increase details and calls the supplied actions', async () => {
  const user = userEvent.setup();
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  renderPreview({ onConfirm, onCancel });

  expect(screen.getByText('ABC-123 Toyota Corolla')).toBeInTheDocument();
  expect(screen.getByText('Zone A')).toBeInTheDocument();
  expect(screen.getAllByText('140.00 €')).toHaveLength(2);
  expect(screen.getByText('-120.00 €')).toBeInTheDocument();
  expect(screen.getByText('20.00 €')).toBeInTheDocument();
  expect(screen.queryByText('Refundable sum')).not.toBeInTheDocument();

  const { confirm, cancel } = getActionButtons();
  await user.click(confirm);
  await user.click(cancel);

  expect(onConfirm).toHaveBeenCalledOnce();
  expect(onCancel).toHaveBeenCalledOnce();
});

it('shows a refund for a price decrease', () => {
  renderPreview({ priceChangesList: createPriceDecrease() });

  expect(screen.getByText('Refundable sum')).toBeInTheDocument();
  expect(screen.getByText('Incl. vat')).toBeInTheDocument();
  expect(screen.getAllByText('-20.00 €')).toHaveLength(2);
  expect(screen.getByText('-4.00 €')).toBeInTheDocument();
});

it('shows absolute refund amounts and hides order totals for refunds', () => {
  renderPreview({
    isRefund: true,
    priceChangesList: createPriceDecrease(),
  });

  expect(screen.getByText('20.00 €')).toBeInTheDocument();
  expect(screen.getByText('4.00 €')).toBeInTheDocument();
  expect(screen.queryByText('New order, total price')).not.toBeInTheDocument();
  expect(screen.queryByText('Price difference')).not.toBeInTheDocument();
});

it('renders vehicle copyright information and context errors', () => {
  renderPreview({
    error: 'Vehicle update failed',
    priceChangesList: [
      {
        vehicle,
        priceChanges: [createPriceChange()],
      },
    ],
  });

  expect(screen.getByText('ABC-123 Toyota Corolla')).toBeInTheDocument();
  expect(
    screen.getByText(/^Source: Transport register, Traficom/)
  ).toBeInTheDocument();
  expect(screen.getByText('Vehicle update failed')).toBeInTheDocument();
});

it('locks both actions while confirming and unlocks them when it settles', async () => {
  const user = userEvent.setup();
  const pending = Promise.withResolvers<void>();
  const onConfirm = vi.fn(() => pending.promise);
  const onCancel = vi.fn();
  renderPreview({ onConfirm, onCancel });

  const { confirm, cancel } = getActionButtons();

  await user.dblClick(confirm);
  expect(onConfirm).toHaveBeenCalledOnce();
  expect(confirm).toBeDisabled();
  expect(cancel).toBeDisabled();
  expect(screen.getByRole('status')).toBeInTheDocument();

  await user.click(cancel);
  expect(onCancel).not.toHaveBeenCalled();

  await act(async () => pending.resolve());

  expect(confirm).toBeEnabled();
  expect(cancel).toBeEnabled();
});
