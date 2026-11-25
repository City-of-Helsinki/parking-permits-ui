import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addMonths, subDays, subWeeks } from 'date-fns';
import { MemoryRouter, Route, Routes } from 'react-router';
import { PermitStateContext } from '../../hooks/permitProvider';
import { UserProfileContext } from '../../hooks/userProfileProvider';
import {
  ParkingContractType,
  Permit,
  PermitActions,
  PermitStatus,
  ProfileActions,
  ROUTES,
} from '../../types';
import ValidPermits from './ValidPermits';

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

vi.mock('../../common/permit/Permit', () => ({ default: () => null }));

it('opens the purchase flow for another vehicle a week after buying a subscription', async () => {
  const start = subWeeks(new Date(), 1);
  const end = subDays(addMonths(start, 1), 1);
  const primary = {
    id: 'primary',
    primaryVehicle: true,
    status: PermitStatus.VALID,
    contractType: ParkingContractType.OPEN_ENDED,
    startTime: start,
    endTime: end,
    currentPeriodEndTime: end,
    vehicle: { registrationNumber: 'ABC-123' },
  } as Permit;
  const permits = {
    getValidPermits: () => [primary],
    permitsHaveOutdatedAddresses: () => false,
  };
  const profile = { getProfile: () => ({ firstName: 'Test' }) };

  render(
    <MemoryRouter>
      <UserProfileContext.Provider value={profile as ProfileActions}>
        <PermitStateContext.Provider value={permits as PermitActions}>
          <Routes>
            <Route path="/" element={<ValidPermits />} />
            <Route
              path={ROUTES.PERMIT_PRICES}
              element={<div>Permit prices</div>}
            />
          </Routes>
        </PermitStateContext.Provider>
      </UserProfileContext.Provider>
    </MemoryRouter>
  );

  await userEvent.click(
    screen.getByRole('button', {
      name: 'Add another vehicle',
    })
  );
  expect(screen.getByText('Permit prices')).toBeVisible();
});
