import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { PermitStateContext } from '../../hooks/permitProvider';
import {
  ParkingContractType,
  Permit as PermitModel,
  PermitActions,
  PermitStatus,
  UserAddress,
} from '../../types';
import Permit from './Permit';

vi.mock('../parkingZoneMap/ParkingZonesMap', () => ({ default: () => null }));
vi.mock('../addressLabel/AddressLabel', () => ({ default: () => null }));

vi.mock('react-i18next', async importOriginal => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  const { createEnglishReactI18nextMock } = await import(
    '../../__tests__/i18n'
  );
  return {
    ...actual,
    ...(await createEnglishReactI18nextMock()),
  };
});

const getChangeAddressButton = () =>
  screen.getByRole('button', { name: 'Update the address' });
const queryChangeAddressButton = () =>
  screen.queryByRole('button', { name: 'Update the address' });
const getEditVehicleButton = () =>
  screen.getByRole('button', { name: 'Edit vehicle information' });
const getNewVehicleOption = () =>
  screen.getByLabelText(
    "Change the permit's vehicle permanently. The change may affect the price of the permit."
  );
const queryNewVehicleOption = () =>
  screen.queryByLabelText(
    "Change the permit's vehicle permanently. The change may affect the price of the permit."
  );

const makePermit = (overrides: Partial<PermitModel>): PermitModel =>
  ({
    id: '1',
    status: PermitStatus.VALID,
    contractType: ParkingContractType.OPEN_ENDED,
    startTime: '2025-01-01T00:00:00+02:00',
    endTime: '2025-02-01T00:00:00+02:00',
    currentPeriodEndTime: '2025-02-01T00:00:00+02:00',
    vehicle: { registrationNumber: 'ABC-123', manufacturer: 'M', model: 'X' },
    parkingZone: { name: 'A' },
    isInRenewalPeriod: false,
    changesAvailableFrom: null,
    ...overrides,
  } as PermitModel);

const renderPermit = (permits: PermitModel[]) => {
  const permitCtx = {
    permitsHaveOutdatedAddresses: () => false,
    permitsHaveStarted: () => true,
  } as unknown as PermitActions;
  render(
    <MemoryRouter>
      <PermitStateContext.Provider value={permitCtx}>
        <Permit
          address={{} as UserAddress}
          permits={permits}
          showActionsButtons
          showChangeAddressButtons
        />
      </PermitStateContext.Provider>
    </MemoryRouter>
  );
};

it('shows change address button when no permit is in renewal period', () => {
  renderPermit([makePermit({})]);
  expect(getChangeAddressButton()).toBeInTheDocument();
  expect(
    screen.queryByText(
      'The permit is being renewed. Vehicle and address changes are possible again from 2.2.2025.'
    )
  ).not.toBeInTheDocument();
});

it('hides change address button when any permit is in renewal period', () => {
  renderPermit([
    makePermit({}),
    makePermit({
      id: '2',
      vehicle: {
        registrationNumber: 'XYZ-999',
        manufacturer: 'M',
        model: 'Y',
      } as PermitModel['vehicle'],
      isInRenewalPeriod: true,
      changesAvailableFrom: '2025-02-02',
    }),
  ]);
  expect(queryChangeAddressButton()).not.toBeInTheDocument();
  expect(
    screen.getAllByText(
      'The permit is being renewed. Vehicle and address changes are possible again from 2.2.2025.'
    )
  ).toHaveLength(2);
});

it('hides permanent vehicle change option during renewal period', async () => {
  renderPermit([
    makePermit({ isInRenewalPeriod: true, changesAvailableFrom: '2025-02-02' }),
  ]);
  await userEvent.click(getEditVehicleButton());
  expect(queryNewVehicleOption()).not.toBeInTheDocument();
  expect(
    screen.getByLabelText(
      'Add a temporary vehicle. The duration is a maximum of 14 days. The change does not affect the price of the permit.'
    )
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      'Vehicle and address changes are possible again from 2.2.2025.'
    )
  ).toBeInTheDocument();
});

it('restricts changes in renewal period even without an available date', async () => {
  renderPermit([
    makePermit({ isInRenewalPeriod: true, changesAvailableFrom: null }),
  ]);
  expect(queryChangeAddressButton()).not.toBeInTheDocument();
  await userEvent.click(getEditVehicleButton());
  expect(queryNewVehicleOption()).not.toBeInTheDocument();
});

it('shows permanent vehicle change option outside renewal period', async () => {
  renderPermit([makePermit({})]);
  await userEvent.click(getEditVehicleButton());
  expect(getNewVehicleOption()).toBeInTheDocument();
});
