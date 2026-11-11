import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PermitStateContext } from '../../../hooks/permitProvider';
import { VehicleChangeErrorContext } from '../../../hooks/vehicleChangeErrorProvider';
import { Permit, ROUTES, Vehicle } from '../../../types';
import VehicleDetails from '../VehicleDetails';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  getVehicleInformation: vi.fn(),
  getRestrictions: vi.fn(),
}));

vi.mock('react-router', () => ({ useNavigate: () => mocks.navigate }));
vi.mock('../../../graphql/permitGqlClient', () => ({
  getVehicleInformation: mocks.getVehicleInformation,
}));
vi.mock('../../discountLabel/DiscountLabel', () => ({
  default: () => <span>discount-label</span>,
}));
vi.mock('../../../utils', () => ({
  formatDate: () => 'date',
  formatErrors: () => 'formatted-error',
  formatMonthlyPrice: () => 'price',
  getPermitStartDate: () => 'start',
  getPermitEndDate: () => 'end',
  calcProductUnitPrice: () => 1,
  getRestrictions: mocks.getRestrictions,
  formatDateTimeDisplay: () => 'datetime',
}));

const P = 'common.editPermits.ChangeVehicle';

const baseVehicle: Vehicle = {
  id: '1',
  isLowEmission: false,
  manufacturer: 'Make',
  model: 'Model',
  productionYear: 2000,
  registrationNumber: 'ABC-123',
  updatedFromTraficomOn: null,
  restrictions: [],
};

const permit = { products: [{}, {}] } as unknown as Permit;

const setup = ({
  vehicle,
  error = '',
  permitExists = false,
}: {
  vehicle?: Vehicle;
  error?: string;
  permitExists?: boolean;
} = {}) => {
  const props = {
    permit,
    vehicle,
    onContinue: vi.fn(),
    setVehicle: vi.fn(),
    lowEmissionChecked: false,
    setLowEmissionChecked: vi.fn(),
  };
  const setError = vi.fn();
  render(
    <PermitStateContext.Provider
      value={{ permitExists: () => permitExists } as never}>
      <VehicleChangeErrorContext.Provider value={{ error, setError }}>
        <VehicleDetails {...props} />
      </VehicleChangeErrorContext.Provider>
    </PermitStateContext.Provider>
  );
  return { props, setError };
};

const button = (key: string) =>
  screen.getByRole<HTMLButtonElement>('button', { name: `${P}.${key}` });

describe('VehicleDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getRestrictions.mockReturnValue([]);
  });

  it('renders without vehicle details and disables continue', () => {
    setup();
    expect(screen.queryByText('ABC-123')).toBeNull();
    expect(button('actionBtn.continue').disabled).toBe(true);
  });

  it('uppercases registration input and flags existing permits', () => {
    const { setError } = setup({ permitExists: true });
    const input = screen.getByRole<HTMLInputElement>('textbox');
    fireEvent.change(input, { target: { value: 'abc-1' } });
    expect(input.value).toBe('ABC-1');
    expect(setError).toHaveBeenLastCalledWith(`${P}.permitExistError`);
  });

  it('fetches vehicle information and passes it to setVehicle', async () => {
    mocks.getVehicleInformation.mockResolvedValue(baseVehicle);
    const { props } = setup();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'abc-123' },
    });
    fireEvent.click(button('changeBtn'));
    await waitFor(() =>
      expect(props.setVehicle).toHaveBeenCalledWith(baseVehicle)
    );
    expect(mocks.getVehicleInformation).toHaveBeenCalledWith('ABC-123');
  });

  it('sets formatted error when fetching fails', async () => {
    mocks.getVehicleInformation.mockRejectedValue(new Error('x'));
    const { setError } = setup();
    fireEvent.click(button('changeBtn'));
    await waitFor(() =>
      expect(setError).toHaveBeenCalledWith('formatted-error')
    );
  });

  it('shows error notification and disables change button on error', () => {
    setup({ error: 'some-error' });
    expect(screen.getByText('some-error')).toBeTruthy();
    expect(button('changeBtn').disabled).toBe(true);
  });

  it('renders high emission vehicle with prices and copyright', () => {
    setup({
      vehicle: { ...baseVehicle, updatedFromTraficomOn: '2000-01-01' },
    });
    expect(screen.getByText('ABC-123')).toBeTruthy();
    expect(screen.getByText(`${P}.highEmissionVehicle`)).toBeTruthy();
    expect(screen.getAllByText('price')).toHaveLength(2);
    expect(
      screen.getByText(new RegExp(`^${P}\\.vehicleCopyright`))
    ).toBeTruthy();
    expect(screen.queryByText('discount-label')).toBeNull();
  });

  it('renders low emission checkbox and toggles it', () => {
    const { props } = setup({
      vehicle: { ...baseVehicle, isLowEmission: true },
    });
    expect(screen.getByText(`${P}.lowEmissionVehicle`)).toBeTruthy();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(props.setLowEmissionChecked).toHaveBeenCalledWith(true);
  });

  it('renders restriction notifications', () => {
    mocks.getRestrictions.mockReturnValue(['r1', 'r2']);
    setup({ vehicle: baseVehicle });
    expect(screen.getAllByText(/^common\.restrictions\.text/)).toHaveLength(2);
  });

  it('calls onContinue and navigates back', async () => {
    const { props } = setup({ vehicle: baseVehicle });
    fireEvent.click(button('actionBtn.continue'));
    await waitFor(() => expect(props.onContinue).toHaveBeenCalledTimes(1));
    fireEvent.click(button('actionBtn.back'));
    expect(mocks.navigate).toHaveBeenCalledWith(ROUTES.VALID_PERMITS);
  });
});
