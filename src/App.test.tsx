import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

jest.mock('hds-react', () => ({
  ...jest.requireActual('hds-react'),
  CookieModal: () => null,
}));

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fi', changeLanguage: jest.fn() },
  }),
}));

jest.mock('./common/mainLayout/MainLayout', () => {
  const { Outlet } = jest.requireActual('react-router-dom');
  return Outlet;
});

jest.mock('./pages/landingPage/LandingPage', () => () => 'Landing page');
jest.mock('./pages/profilePage/ProfilePage', () => () => 'Profile page');
jest.mock('./pages/permitPrices/PermitPrices', () => () => 'Permit prices');

jest.mock('./pages/vehicleSelector/VehicleSelector', () => {
  const { Outlet } = jest.requireActual('react-router-dom');
  return Outlet;
});

jest.mock('./client/HandleCallback', () => {
  const { useLocation } = jest.requireActual('react-router');
  const CallbackRoute = () => {
    const { pathname, search } = useLocation();
    return <span>{`${pathname}${search}`}</span>;
  };
  return CallbackRoute;
});

jest.mock('./pages/changeVehicle/ChangeVehicle', () => {
  const { useNavigate, useParams } = jest.requireActual('react-router');
  const ChangeVehicleRoute = () => {
    const { permitId } = useParams();
    const navigate = useNavigate();
    return (
      <button type="button" onClick={() => navigate('/profile')}>
        {`Change vehicle ${permitId}`}
      </button>
    );
  };
  return ChangeVehicleRoute;
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
