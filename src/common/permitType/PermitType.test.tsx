import { render, screen } from '@testing-library/react';
import { ParkingContractType, Permit, PermitStatus } from '../../types';
import PermitType from './PermitType';

it.each([
  [ParkingContractType.OPEN_ENDED, ParkingContractType.FIXED_PERIOD],
  [ParkingContractType.FIXED_PERIOD, ParkingContractType.OPEN_ENDED],
])('allows only %s for a second permit', (allowed, other) => {
  const primary = {
    primaryVehicle: true,
    startTime: '2026-02-01',
    status: PermitStatus.VALID,
    contractType: allowed,
  } as Permit;
  render(
    <PermitType
      primaryPermit={primary}
      mainPermitToUpdate={{
        ...primary,
        primaryVehicle: false,
        status: PermitStatus.DRAFT,
      }}
      isContractTypeChecked
      isStartTypeChecked
      updateContractType={vi.fn()}
      updatePermitData={vi.fn()}
      updateStartType={vi.fn()}
    />
  );
  const options = screen.getAllByRole<HTMLInputElement>('radio');
  expect(options.find(option => option.value === allowed)).toBeEnabled();
  expect(options.find(option => option.value === other)).toBeDisabled();
});
