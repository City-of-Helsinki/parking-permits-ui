import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { FetchStatus } from '../../../client/types';
import { PermitStateContext } from '../../../hooks/permitProvider';
import {
  ParkingContractType,
  Permit,
  PermitActions,
  Product,
  ROUTES,
  STEPPER,
  UserAddress,
} from '../../../types';
import DurationSelector from '../DurationSelector';

vi.mock('../../../common/permit/Permit', () => ({
  default: ({ permits }: { permits: Permit[] }) => (
    <div>valid permits: {permits.length}</div>
  ),
}));

vi.mock('../../../common/permitType/PermitType', () => ({
  default: (props: {
    updateContractType: (p: Partial<Permit>, id: string) => void;
    updateStartType: (p: Partial<Permit>, id: string) => void;
    mainPermitToUpdate: Permit;
  }) => (
    <>
      <button
        onClick={() =>
          props.updateContractType({}, props.mainPermitToUpdate.id)
        }>
        set contract
      </button>
      <button
        onClick={() => props.updateStartType({}, props.mainPermitToUpdate.id)}>
        set start
      </button>
    </>
  ),
}));

const address = { zone: { name: 'Z1' } } as UserAddress;

const product: Product = {
  name: 'test product',
  vat: 0,
  quantity: 1,
  startDate: '2026-01-02',
  endDate: '2026-02-01',
  unitPrice: 30,
  totalPrice: 45.5,
  basePrice: 0,
  discountPrice: 0,
  lowEmissionDiscount: 0,
};

const createPermit = (overrides: Partial<Permit> = {}): Permit =>
  ({
    id: 'permit-1',
    status: 'DRAFT',
    contractType: ParkingContractType.FIXED_PERIOD,
    primaryVehicle: true,
    products: [product],
    startTime: '2026-01-02',
    endTime: '2026-02-01',
    currentPeriodEndTime: '2026-02-01',
    monthCount: 1,
    vehicle: {
      registrationNumber: 'TEST-1',
      manufacturer: 'Make',
      model: 'Model',
      updatedFromTraficomOn: null,
    },
    ...overrides,
  } as unknown as Permit);

const createContext = (draft: Permit[], valid: Permit[] = []) => ({
  getStep: vi.fn<() => number>(() => STEPPER.DURATION_SELECTOR),
  setStep: vi.fn(),
  getSelectedAddress: vi.fn<() => UserAddress | undefined>(() => address),
  getDraftPermits: vi.fn(() => draft),
  getValidPermits: vi.fn(() => valid),
  getStatus: vi.fn<() => FetchStatus>(() => 'loaded'),
  getErrorMessage: vi.fn(() => 'test error'),
  updatePermit: vi.fn(),
  createOrderRequest: vi.fn(),
});

const renderPage = (context: ReturnType<typeof createContext>) =>
  render(
    <MemoryRouter initialEntries={['/test']}>
      <PermitStateContext.Provider value={context as unknown as PermitActions}>
        <Routes>
          <Route path="/test" element={<DurationSelector />} />
          <Route path={ROUTES.ADDRESS} element={<div>address page</div>} />
          <Route path={ROUTES.PERMIT_PRICES} element={<div>prices page</div>} />
        </Routes>
      </PermitStateContext.Provider>
    </MemoryRouter>
  );

const continueButton = () =>
  screen.getByRole('button', { name: /actionBtn.continue/ });

describe('DurationSelector', () => {
  it('redirects without an address or without draft permits', () => {
    const noAddress = createContext([createPermit()]);
    noAddress.getSelectedAddress.mockReturnValue(undefined);
    const { unmount } = renderPage(noAddress);
    expect(screen.getByText('address page')).toBeInTheDocument();
    unmount();

    renderPage(createContext([]));
    expect(screen.getByText('prices page')).toBeInTheDocument();
  });

  it('renders zone, car details, error and vehicle copyright', () => {
    const context = createContext([
      createPermit({
        vehicle: {
          ...createPermit().vehicle,
          updatedFromTraficomOn: '2026-01-01T10:00:00',
        },
      }),
    ]);
    context.getStatus.mockReturnValue('error');
    renderPage(context);

    expect(screen.getByText('Z1')).toBeInTheDocument();
    expect(screen.getByText('TEST-1 Make Model')).toBeInTheDocument();
    expect(screen.getByText('sectionLabel')).toBeInTheDocument();
    expect(screen.getByText('test error')).toBeInTheDocument();
    expect(screen.getByText(/vehicleCopyright/)).toBeInTheDocument();
    expect(screen.queryByText(/permitCount/)).not.toBeInTheDocument();
  });

  it('numbers multiple drafts and lists valid permits', () => {
    const primary = createPermit({ id: 'valid-1' });
    const context = createContext(
      [
        createPermit({ id: 'draft-1', primaryVehicle: false }),
        createPermit({ id: 'draft-2', primaryVehicle: true }),
      ],
      [primary]
    );
    renderPage(context);

    expect(screen.getByText('secondPermitLabel')).toBeInTheDocument();
    expect(screen.getByText(/validPermitCount/)).toBeInTheDocument();
    expect(screen.getByText('valid permits: 1')).toBeInTheDocument();
    expect(screen.getByText('permitCount {"count":1}')).toBeInTheDocument();
    expect(screen.getByText('permitCount {"count":2}')).toBeInTheDocument();
  });

  it('shows total price and dates for fixed period permits', () => {
    renderPage(createContext([createPermit()]));

    expect(screen.getAllByText('(2.1.2026 - 1.2.2026)')).toHaveLength(2);
    expect(screen.getAllByText('45.50 €')).toHaveLength(2);
  });

  it('shows monthly price and no month input for open ended permits', () => {
    renderPage(
      createContext([
        createPermit({ contractType: ParkingContractType.OPEN_ENDED }),
      ])
    );

    expect(screen.getAllByText('30.00 common.pricePerMonth')).toHaveLength(2);
    expect(screen.getByText('openEndedAssistiveText')).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('enables the month input after start type is set and updates the permit', async () => {
    const context = createContext([createPermit({ id: 'draft-1' })]);
    renderPage(context);

    expect(screen.getByRole('spinbutton')).toBeDisabled();
    expect(screen.getByText(/fixedPeriodAssistiveText/)).toHaveTextContent(
      '"max":12'
    );

    await userEvent.click(screen.getByText('set start'));
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '5' },
    });

    expect(screen.getByRole('spinbutton')).toBeEnabled();
    expect(context.updatePermit).toHaveBeenCalledWith(
      { monthCount: 5, contractType: ParkingContractType.FIXED_PERIOD },
      'draft-1'
    );

    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '' },
    });

    expect(context.updatePermit).toHaveBeenLastCalledWith(
      { monthCount: 0, contractType: ParkingContractType.FIXED_PERIOD },
      'draft-1'
    );
  });

  describe('max months of a second permit', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-01-01T00:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it.each([
      // primary permit ends with dangling days after three months: rounds up
      { endTime: '2026-04-15T00:00:00', max: 4 },
      // primary permit ends exactly after three months
      { endTime: '2026-04-02T00:00:00', max: 3 },
    ])('is $max when primary ends $endTime', ({ endTime, max }) => {
      const primary = createPermit({ id: 'valid-1', endTime });
      const secondary = createPermit({ id: 'draft-1', primaryVehicle: false });
      renderPage(createContext([secondary], [primary]));

      expect(screen.getByText(/fixedPeriodAssistiveText/)).toHaveTextContent(
        `"max":${max}`
      );
      expect(screen.getByRole('spinbutton')).toHaveAttribute(
        'max',
        String(max)
      );
    });

    it('is 12 when the primary permit is open ended', () => {
      const primary = createPermit({
        id: 'valid-1',
        contractType: ParkingContractType.OPEN_ENDED,
      });
      const secondary = createPermit({ id: 'draft-1', primaryVehicle: false });
      renderPage(createContext([secondary], [primary]));

      expect(screen.getByRole('spinbutton')).toHaveAttribute('max', '12');
    });
  });

  it('requires contract and start type before continuing, then orders', async () => {
    const context = createContext([createPermit()]);
    renderPage(context);

    expect(continueButton()).toBeDisabled();
    await userEvent.click(screen.getByText('set contract'));
    expect(continueButton()).toBeDisabled();
    await userEvent.click(screen.getByText('set start'));

    const button = continueButton();
    expect(button).toBeEnabled();
    await userEvent.click(button);

    expect(context.createOrderRequest).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();
    expect(button).not.toHaveTextContent('actionBtn.continue');
  });

  it('navigates back to permit prices', async () => {
    renderPage(createContext([createPermit()]));

    await userEvent.click(
      screen.getByRole('button', { name: /actionBtn.back/ })
    );

    expect(screen.getByText('prices page')).toBeInTheDocument();
  });
});
