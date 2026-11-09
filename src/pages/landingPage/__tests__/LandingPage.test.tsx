import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { FetchStatus } from '../../../client/types';
import { PermitStateContext } from '../../../hooks/permitProvider';
import { UserProfileContext } from '../../../hooks/userProfileProvider';
import {
  Permit,
  PermitActions,
  ProfileActions,
  ROUTES,
  UserAddress,
  UserProfile,
} from '../../../types';
import LandingPage from '../LandingPage';

const mockLogin = vi.fn();
const mockLogout = vi.fn();
let mockAuthenticated = false;

vi.mock('hds-react', async importOriginal => ({
  ...(await importOriginal<typeof import('hds-react')>()),
  useOidcClient: () => ({
    login: mockLogin,
    logout: mockLogout,
    isAuthenticated: () => mockAuthenticated,
  }),
}));

const T_PATH = 'pages.landingPage.LandingPage';
const zoneAddress = { zone: { name: 'Z1' } } as UserAddress;
const noZoneAddress = {} as UserAddress;

const createProfile = (overrides: Partial<UserProfile> = {}): UserProfile =>
  ({
    age: 30,
    primaryAddress: zoneAddress,
    otherAddress: noZoneAddress,
    ...overrides,
  } as UserProfile);

interface RenderOptions {
  profile?: UserProfile;
  profileStatus?: FetchStatus;
  profileError?: string;
  permitStatus?: FetchStatus;
  permitError?: string;
  validPermits?: Permit[];
  withContexts?: boolean;
}

const renderPage = ({
  profile = createProfile(),
  profileStatus = 'loaded',
  profileError,
  permitStatus = 'loading',
  permitError,
  validPermits = [],
  withContexts = true,
}: RenderOptions = {}) => {
  const profileCtx = {
    getProfile: () => profile,
    getStatus: () => profileStatus,
    getErrorMessage: () => profileError,
  } as unknown as ProfileActions;
  const permitCtx = {
    getStatus: () => permitStatus,
    getErrorMessage: () => permitError,
    getValidPermits: () => validPermits,
  } as unknown as PermitActions;

  return render(
    <UserProfileContext.Provider value={withContexts ? profileCtx : null}>
      <PermitStateContext.Provider value={withContexts ? permitCtx : null}>
        <MemoryRouter initialEntries={[ROUTES.LANDING]}>
          <Routes>
            <Route path={ROUTES.LANDING} element={<LandingPage />} />
            <Route
              path={ROUTES.VALID_PERMITS}
              element={<div>valid permits page</div>}
            />
            <Route path={ROUTES.ADDRESS} element={<div>address page</div>} />
          </Routes>
        </MemoryRouter>
      </PermitStateContext.Provider>
    </UserProfileContext.Provider>
  );
};

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticated = false;
  });

  it('shows profile error with priority over other states', () => {
    renderPage({
      profileStatus: 'error',
      profileError: 'profile failed',
      profile: createProfile({ age: 1 }),
    });

    expect(screen.getByText('profile failed')).toBeInTheDocument();
    expect(screen.queryByText(`${T_PATH}.underAgeLabel`)).toBeNull();
    expect(screen.queryByText(`${T_PATH}.login`)).toBeNull();
  });

  it('shows under age notification and logs out on click', async () => {
    renderPage({
      profile: createProfile({ age: 17 }),
      permitStatus: 'loaded',
      validPermits: [{} as Permit],
    });

    expect(screen.getByText(`${T_PATH}.underAgeLabel`)).toBeInTheDocument();
    expect(screen.getByText(`${T_PATH}.underAgeMessage`)).toBeInTheDocument();
    expect(screen.queryByText('valid permits page')).toBeNull();

    await userEvent.click(screen.getByText(`${T_PATH}.logout`));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('allows a user whose age equals the age limit', () => {
    renderPage({ profile: createProfile({ age: 18 }) });

    expect(screen.queryByText(`${T_PATH}.underAgeLabel`)).toBeNull();
    expect(screen.getByText(`${T_PATH}.login`)).toBeInTheDocument();
  });

  it('shows no valid address notification and logs out on click', async () => {
    renderPage({
      profile: createProfile({ primaryAddress: noZoneAddress }),
      permitStatus: 'loaded',
    });

    expect(
      screen.getByText(`${T_PATH}.noValidAddressLabel`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${T_PATH}.noValidAddressMessage`)
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText(`${T_PATH}.logout`));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      'other address has a zone',
      {
        profile: createProfile({
          primaryAddress: noZoneAddress,
          otherAddress: zoneAddress,
        }),
        permitStatus: 'loaded' as FetchStatus,
      },
    ],
    [
      'valid permits exist',
      {
        profile: createProfile({ primaryAddress: noZoneAddress }),
        permitStatus: 'loaded' as FetchStatus,
        validPermits: [{} as Permit],
      },
    ],
    [
      'permits are not loaded',
      {
        profile: createProfile({ primaryAddress: noZoneAddress }),
        permitStatus: 'loading' as FetchStatus,
      },
    ],
    [
      'profile is not loaded',
      {
        profile: createProfile({ primaryAddress: noZoneAddress }),
        profileStatus: 'loading' as FetchStatus,
        permitStatus: 'loaded' as FetchStatus,
      },
    ],
  ])('does not show no valid address notification when %s', (_, options) => {
    renderPage(options);

    expect(screen.queryByText(`${T_PATH}.noValidAddressLabel`)).toBeNull();
  });

  it('shows translated permit error', () => {
    renderPage({ permitStatus: 'error', permitError: 'permit failed' });

    expect(screen.getByText('permit failed')).toBeInTheDocument();
  });

  it.each([
    ['valid permits page', [{} as Permit]],
    ['address page', []],
  ])('redirects to %s when permits are loaded', (page, validPermits) => {
    renderPage({ permitStatus: 'loaded', validPermits });

    expect(screen.getByText(page)).toBeInTheDocument();
  });

  it('shows login button when unauthenticated and logs in on click', async () => {
    const { container } = renderPage();

    expect(container.querySelector('.landing-page')?.children).toHaveLength(1);
    await userEvent.click(screen.getByText(`${T_PATH}.login`));
    expect(mockLogin).toHaveBeenCalledTimes(1);
  });

  it('shows loading spinner instead of login button when authenticated', () => {
    mockAuthenticated = true;
    const { container } = renderPage();

    expect(screen.queryByText(`${T_PATH}.login`)).toBeNull();
    expect(container.querySelector('.landing-page')?.children).toHaveLength(1);
  });

  it('renders login fallback without contexts', () => {
    renderPage({ withContexts: false });

    expect(screen.getByText(`${T_PATH}.login`)).toBeInTheDocument();
  });
});
