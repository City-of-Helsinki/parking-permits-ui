import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { removeTemporaryVehicleFromPermit } from '../../../graphql/permitGqlClient';
import { PermitStateContext } from '../../../hooks/permitProvider';
import {
  ParkingContractType,
  Permit as PermitModel,
  PermitActions,
  PermitStatus,
  ROUTES,
  TemporaryVehicle,
  UserAddress,
  Vehicle,
} from '../../../types';
import Permit from '../Permit';

vi.mock('../../../graphql/permitGqlClient', () => ({
  removeTemporaryVehicleFromPermit: vi.fn(),
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

vi.mock('../../addressLabel/AddressLabel', () => ({
  default: () => <div data-testid="address-label" />,
}));

vi.mock('../../parkingZoneMap/ParkingZonesMap', () => ({
  default: () => <div data-testid="parking-map" />,
}));

vi.mock('../../editPermitDialog/EditPermitDialog', async () => {
  const { PermitEditType } = await import('../../../types');

  return {
    default: ({
      isOpen,
      permitId,
      onCancel,
      onConfirm,
    }: {
      isOpen: boolean;
      permitId: string;
      onCancel: () => void;
      onConfirm: (editType: string, permitId: string) => void;
    }) =>
      isOpen ? (
        <div role="dialog">
          <button onClick={() => onConfirm(PermitEditType.TEMPORARY, permitId)}>
            Change vehicle
          </button>
          <button onClick={() => onConfirm(PermitEditType.NEW, permitId)}>
            Add temporary vehicle
          </button>
          <button onClick={onCancel}>Cancel edit</button>
        </div>
      ) : null,
  };
});

vi.mock('../../endPermitDialog/EndPermitDialog', async () => {
  const { PermitEndType } = await import('../../../types');

  return {
    default: ({
      isOpen,
      onCancel,
      onConfirm,
    }: {
      isOpen: boolean;
      onCancel: () => void;
      onConfirm: (endType: string) => void;
    }) =>
      isOpen ? (
        <div role="dialog">
          <button onClick={onCancel}>Cancel ending</button>
          <button onClick={() => onConfirm(PermitEndType.IMMEDIATELY)}>
            Confirm ending
          </button>
        </div>
      ) : null,
  };
});

vi.mock(
  '../../deleteTemporaryVehicleDialog/DeleteTemporaryVehicleDialog',
  () => ({
    default: ({
      isOpen,
      onCancel,
      onConfirm,
    }: {
      isOpen: boolean;
      onCancel: () => void;
      onConfirm: () => void;
    }) =>
      isOpen ? (
        <div role="dialog">
          <button onClick={onCancel}>Cancel temporary vehicle removal</button>
          <button onClick={onConfirm}>Confirm temporary vehicle removal</button>
        </div>
      ) : null,
  })
);

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

const createVehicle = (overrides: Partial<Vehicle> = {}): Vehicle => ({
  id: 'vehicle-1',
  isLowEmission: false,
  manufacturer: 'Toyota',
  model: 'Corolla',
  productionYear: 2020,
  registrationNumber: 'ABC-123',
  updatedFromTraficomOn: null,
  restrictions: [],
  ...overrides,
});

const createTemporaryVehicle = (): TemporaryVehicle => ({
  id: 'temporary-1',
  vehicle: createVehicle({
    id: 'vehicle-2',
    manufacturer: 'Toyota',
    model: 'Yaris',
    productionYear: 2021,
    registrationNumber: 'TMP-123',
  }),
  startTime: '2026-06-01T12:00:00',
  endTime: '2026-06-10T12:00:00',
  isActive: true,
});

const createPermit = (overrides: Partial<PermitModel> = {}): PermitModel =>
  ({
    id: 'permit-1',
    talpaOrderId: '',
    receiptUrl: '',
    checkoutUrl: '',
    updateCardUrl: '',
    status: PermitStatus.VALID,
    primaryVehicle: true,
    consentLowEmissionAccepted: false,
    vehicle: createVehicle(),
    activeTemporaryVehicle: undefined,
    temporaryVehicles: [],
    products: [],
    contractType: ParkingContractType.FIXED_PERIOD,
    monthCount: 12,
    parkingZone: {} as PermitModel['parkingZone'],
    monthsLeft: 0,
    totalRefundAmount: null,
    endingRefundLines: [],
    startTime: '2026-01-02T12:00:00',
    endTime: '2026-02-01T12:00:00',
    currentPeriodEndTime: '2026-02-01T12:00:00',
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
    ...overrides,
  } as unknown as PermitModel);

const LocationProbe = () => {
  const { pathname, search } = useLocation();
  return <div data-testid="location">{`${pathname}${search}`}</div>;
};

const getButton = (name: string) => screen.getByRole('button', { name });

const renderPermits = (
  permits: PermitModel[],
  {
    hideMap,
    showActionsButtons,
    showChangeAddressButtons,
    outdatedAddresses = false,
    permitsHaveStarted = true,
    fetchPermits = vi.fn(),
  }: {
    hideMap?: boolean;
    showActionsButtons?: boolean;
    showChangeAddressButtons?: boolean;
    outdatedAddresses?: boolean;
    permitsHaveStarted?: boolean;
    fetchPermits?: () => void;
  } = {}
) => {
  const actions = {
    permitsHaveOutdatedAddresses: () => outdatedAddresses,
    permitsHaveStarted: () => permitsHaveStarted,
  };

  const result = render(
    <MemoryRouter initialEntries={['/permits']}>
      <PermitStateContext.Provider value={actions as unknown as PermitActions}>
        <Routes>
          <Route
            path="/permits"
            element={
              <Permit
                address={address}
                permits={permits}
                hideMap={hideMap}
                showActionsButtons={showActionsButtons}
                showChangeAddressButtons={showChangeAddressButtons}
                fetchPermits={fetchPermits}
              />
            }
          />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </PermitStateContext.Provider>
    </MemoryRouter>
  );

  return { container: result.container, fetchPermits };
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(removeTemporaryVehicleFromPermit).mockResolvedValue(null as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

it('renders vehicle details, permit dates, map, and vehicle notices', () => {
  const permit = createPermit({
    vehicle: createVehicle({
      isLowEmission: true,
      updatedFromTraficomOn: '2026-01-01T10:00:00',
    }),
  });
  renderPermits([permit]);

  expect(screen.getByTestId('address-label')).toBeInTheDocument();
  expect(screen.getByTestId('parking-map')).toBeInTheDocument();
  expect(screen.getByText('ABC-123 Toyota Corolla')).toBeInTheDocument();
  expect(
    screen.getByText(/2\.1\.2026 12:00 - 1\.2\.2026 12:00/)
  ).toBeInTheDocument();
  expect(screen.getByText(/Fixed period/)).toBeInTheDocument();
  expect(
    screen.getByText(
      'You are entitled to reduced street parking with mobile apps when you pay.'
    )
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Source: Transport register, Traficom/)
  ).toBeInTheDocument();
});

it.each([
  [
    'payment-in-progress',
    { status: PermitStatus.PAYMENT_IN_PROGRESS, talpaOrderId: 'order-1' },
  ],
  ['confirmed draft', { status: PermitStatus.DRAFT, isOrderConfirmed: true }],
  [
    'confirmed preliminary',
    { status: PermitStatus.PRELIMINARY, isOrderConfirmed: true },
  ],
])('marks a %s permit as processing', (_description, overrides) => {
  const { container } = renderPermits([createPermit(overrides)], {
    hideMap: true,
  });

  expect(container.querySelector('.pp-list__title__icon')).toHaveClass(
    'processing'
  );
});

it('splits the permit period around an active temporary vehicle', () => {
  const permit = createPermit({
    endTime: '2026-12-31T12:00:00',
    activeTemporaryVehicle: createTemporaryVehicle(),
  });
  const { container } = renderPermits([permit]);

  expect(screen.getByText('TMP-123 Toyota Yaris')).toBeInTheDocument();
  expect(screen.getByText('ABC-123 Toyota Corolla')).toBeInTheDocument();
  expect(container.querySelectorAll('.pp-list__subtitle')).toHaveLength(3);
});

it('navigates to the address change page when the permits are eligible', async () => {
  const user = userEvent.setup();
  renderPermits([createPermit()], {
    showActionsButtons: true,
    showChangeAddressButtons: true,
  });

  await user.click(getButton('Update the address'));

  expect(screen.getByTestId('location')).toHaveTextContent(
    ROUTES.CHANGE_ADDRESS
  );
});

it('disables address changes for permits with different contract types', () => {
  renderPermits(
    [
      createPermit(),
      createPermit({
        id: 'permit-2',
        primaryVehicle: false,
        contractType: ParkingContractType.OPEN_ENDED,
      }),
    ],
    {
      showActionsButtons: true,
      showChangeAddressButtons: true,
    }
  );

  expect(getButton('Update the address')).toBeDisabled();
});

it('opens the edit dialog and navigates to the vehicle change flow', async () => {
  const user = userEvent.setup();
  renderPermits([createPermit()], { showActionsButtons: true });

  await user.click(getButton('Edit vehicle information'));
  expect(screen.getByRole('dialog')).toBeInTheDocument();

  await user.click(getButton('Change vehicle'));

  expect(screen.getByTestId('location')).toHaveTextContent(
    '/change-vehicle/permit-1'
  );
});

it('can cancel editing or navigate to the temporary vehicle flow', async () => {
  const user = userEvent.setup();
  renderPermits([createPermit()], { showActionsButtons: true });

  await user.click(getButton('Edit vehicle information'));
  await user.click(getButton('Cancel edit'));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  await user.click(getButton('Edit vehicle information'));
  await user.click(getButton('Add temporary vehicle'));

  expect(screen.getByTestId('location')).toHaveTextContent(
    '/temporary-vehicle/permit-1'
  );
});

it('confirms removal of a secondary permit', async () => {
  const user = userEvent.setup();
  renderPermits(
    [createPermit(), createPermit({ id: 'permit-2', primaryVehicle: false })],
    { showActionsButtons: true }
  );

  await user.click(getButton('Remove secondary vehicle'));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  await user.click(getButton('Cancel ending'));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  await user.click(getButton('Remove secondary vehicle'));
  await user.click(getButton('Confirm ending'));

  expect(screen.getByTestId('location')).toHaveTextContent(
    `${ROUTES.END_PERMITS}?permitIds=permit-2&endType=IMMEDIATELY`
  );
});

it('removes a temporary vehicle and refreshes the permits', async () => {
  const user = userEvent.setup();
  const fetchPermits = vi.fn();
  const permit = createPermit({
    activeTemporaryVehicle: createTemporaryVehicle(),
  });
  renderPermits([permit], { fetchPermits });

  await user.click(getButton('Delete temporary vehicle'));
  await user.click(getButton('Cancel temporary vehicle removal'));
  expect(removeTemporaryVehicleFromPermit).not.toHaveBeenCalled();

  await user.click(getButton('Delete temporary vehicle'));
  await user.click(getButton('Confirm temporary vehicle removal'));

  await waitFor(() =>
    expect(removeTemporaryVehicleFromPermit).toHaveBeenCalledWith('permit-1')
  );
  expect(fetchPermits).toHaveBeenCalledOnce();
});

it('opens the update-card URL for an open-ended permit', async () => {
  const user = userEvent.setup();
  const open = vi.spyOn(window, 'open').mockImplementation(() => null);
  renderPermits([
    createPermit({
      contractType: ParkingContractType.OPEN_ENDED,
      updateCardUrl: 'https://example.com/update-card',
    }),
  ]);

  await user.click(getButton('Edit payment card details'));

  expect(open).toHaveBeenCalledWith('https://example.com/update-card', '_self');
});
