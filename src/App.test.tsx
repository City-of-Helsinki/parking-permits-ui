import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import App from './App';

vi.mock('hds-react', async importOriginal => ({
  ...(await importOriginal<typeof import('hds-react')>()),
  CookieModal: () => null,
}));

vi.mock('./common/mainLayout/MainLayout', async () => {
  const { Outlet } = await import('react-router');
  return { default: Outlet };
});

vi.mock('./pages/landingPage/LandingPage', () => ({
  default: () => 'Landing page',
}));
vi.mock('./pages/profilePage/ProfilePage', () => ({
  default: () => 'Profile page',
}));
vi.mock('./pages/permitPrices/PermitPrices', () => ({
  default: () => 'Permit prices',
}));

vi.mock('./pages/vehicleSelector/VehicleSelector', async () => {
  const { Outlet } = await import('react-router');
  return { default: Outlet };
});

vi.mock('./client/HandleCallback', async () => {
  const { useLocation } = await import('react-router');
  const CallbackRoute = () => {
    const { pathname, search } = useLocation();
    return <span>{`${pathname}${search}`}</span>;
  };
  return { default: CallbackRoute };
});

vi.mock('./pages/changeVehicle/ChangeVehicle', async () => {
  const { useNavigate, useParams } = await import('react-router');
  const ChangeVehicleRoute = () => {
    const { permitId } = useParams();
    const navigate = useNavigate();
    return (
      <button type="button" onClick={() => navigate('/profile')}>
        {`Change vehicle ${permitId}`}
      </button>
    );
  };
  return { default: ChangeVehicleRoute };
});

const renderAt = (path: string) => {
  window.history.replaceState(null, '', path);
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

it.each(['/', '/unknown-route'])(
  'redirects %s to the landing page',
  async path => {
    renderAt(path);

    expect(await screen.findByText('Landing page')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/landing-page');
  }
);

it('preserves login callback query parameters for core router hooks', () => {
  renderAt('/callback?code=login-code&state=login-state');

  expect(
    screen.getByText('/callback?code=login-code&state=login-state')
  ).toBeInTheDocument();
});

it('shares route parameters and navigation with core router hooks', async () => {
  const user = userEvent.setup();
  renderAt('/change-vehicle/permit-123');

  await user.click(
    screen.getByRole('button', { name: 'Change vehicle permit-123' })
  );

  expect(await screen.findByText('Profile page')).toBeInTheDocument();
  expect(window.location.pathname).toBe('/profile');
});

it('renders nested permit price routes', () => {
  renderAt('/vehicle/permit-prices');

  expect(screen.getByText('Permit prices')).toBeInTheDocument();
});
