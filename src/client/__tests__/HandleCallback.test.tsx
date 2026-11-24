import { act, render, screen } from '@testing-library/react';
import { OidcClientError } from 'hds-react';
import type { ReactNode } from 'react';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router';
import HandleCallback from '../HandleCallback';

const {
  mockCaptureException,
  mockIsAuthenticated,
  mockOnError,
  mockOnSuccess,
} = vi.hoisted(() => ({
  mockCaptureException: vi.fn(),
  mockIsAuthenticated: vi.fn(),
  mockOnError: vi.fn<(error: OidcClientError | undefined) => void>(),
  mockOnSuccess: vi.fn<() => void>(),
}));

vi.mock('@sentry/react', async importOriginal => ({
  ...(await importOriginal<typeof import('@sentry/react')>()),
  captureException: mockCaptureException,
}));

vi.mock('hds-react', async importOriginal => {
  const hds = await importOriginal<typeof import('hds-react')>();

  return {
    ...hds,
    LoginCallbackHandler: ({
      children,
      onSuccess,
      onError,
    }: {
      children: ReactNode;
      onSuccess: () => void;
      onError: (error: OidcClientError | undefined) => void;
    }) => {
      mockOnSuccess.mockImplementation(onSuccess);
      mockOnError.mockImplementation(onError);
      return <>{children}</>;
    },
    useOidcClient: () => ({ isAuthenticated: mockIsAuthenticated }),
  };
});

const CALLBACK_PATH = '/callback/';

const RouterState = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  return (
    <>
      <span data-testid="pathname">{pathname}</span>
      <span data-testid="navigation-type">{navigationType}</span>
    </>
  );
};

const renderAt = (pathname = CALLBACK_PATH, authenticated = false) => {
  mockIsAuthenticated.mockReturnValue(authenticated);

  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Routes>
        <Route
          path="*"
          element={
            <HandleCallback>
              <div>Application content</div>
            </HandleCallback>
          }
        />
      </Routes>
      <RouterState />
    </MemoryRouter>
  );
};

const spyOnConsoleError = () =>
  vi.spyOn(console, 'error').mockImplementation(() => {});

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

it('shows the callback handler for unauthenticated callback requests', () => {
  renderAt();

  expect(screen.getByText('Logging in...')).toBeInTheDocument();
  expect(screen.queryByText('Application content')).not.toBeInTheDocument();
});

it.each([
  ['a non-callback route', '/permits', false],
  ['an authenticated callback request', CALLBACK_PATH, true],
])('renders children for %s', (_description, pathname, authenticated) => {
  renderAt(pathname, authenticated);

  expect(screen.getByText('Application content')).toBeInTheDocument();
  expect(screen.queryByText('Logging in...')).not.toBeInTheDocument();
});

it('navigates to the base route with history replacement on success', async () => {
  renderAt();

  act(() => mockOnSuccess());

  expect(screen.getByTestId('pathname')).toHaveTextContent('/');
  expect(screen.getByTestId('navigation-type')).toHaveTextContent('REPLACE');
});

it('logs and ignores an undefined callback error', () => {
  const consoleError = spyOnConsoleError();
  renderAt();

  act(() => mockOnError(undefined));

  expect(consoleError).toHaveBeenCalledWith(undefined);
  expect(mockCaptureException).not.toHaveBeenCalled();
});

it('logs and reports an unexpected callback error to Sentry', () => {
  const consoleError = spyOnConsoleError();
  const error = new OidcClientError(
    'Unexpected callback error',
    'RENEWAL_FAILED'
  );
  renderAt();

  act(() => mockOnError(error));

  expect(consoleError).toHaveBeenCalledWith(error);
  expect(mockCaptureException).toHaveBeenCalledWith(error);
});

it('logs but does not report the known HDS callback error to Sentry', () => {
  const consoleError = spyOnConsoleError();
  const error = new OidcClientError(
    'Current state (HANDLING_LOGIN_CALLBACK) cannot be handled by a callback',
    'SIGNIN_ERROR'
  );
  renderAt();

  act(() => mockOnError(error));

  expect(consoleError).toHaveBeenCalledWith(error);
  expect(mockCaptureException).not.toHaveBeenCalled();
});
