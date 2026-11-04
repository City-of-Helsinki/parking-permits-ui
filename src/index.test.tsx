jest.mock('@sentry/react', () => ({
  init: jest.fn(),
  browserTracingIntegration: jest.fn(() => ({ name: 'BrowserTracing' })),
  replayIntegration: jest.fn(() => ({ name: 'Replay' })),
}));
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({ render: jest.fn() })),
}));
jest.mock('./App', () => () => null);
jest.mock('./client/LoginProvider', () => () => null);
jest.mock('./hooks/permitProvider', () => ({ PermitProvider: () => null }));
jest.mock('./hooks/userProfileProvider', () => ({
  UserProfileProvider: () => null,
}));
jest.mock('./hooks/vehicleChangeErrorProvider', () => ({
  VehicleChangeErrorProvider: () => null,
}));
jest.mock('./i18n/i18n', () => ({}));
jest.mock('./reportWebVitals', () => jest.fn());

const originalEnv = process.env;
const sentryDsn = 'https://public@example.com/1';

function loadSentryOptions() {
  let options: Record<string, unknown> | undefined;
  jest.isolateModules(() => {
    jest.requireActual('./index');
    const sentry = jest.requireMock<{ init: jest.Mock }>('@sentry/react');
    [options] = sentry.init.mock.calls[0] || [];
  });
  return options;
}

beforeEach(() => {
  process.env = { ...originalEnv };
  Object.keys(process.env)
    .filter(key => key.startsWith('REACT_APP_SENTRY_'))
    .forEach(key => {
      delete process.env[key];
    });
});

afterEach(() => {
  process.env = originalEnv;
});

it('does not initialize Sentry without a DSN', () => {
  expect(loadSentryOptions()).toBeUndefined();
});

it.each(['review', 'development', 'testing', 'staging', 'production'])(
  'initializes Sentry in %s with tracing and replays disabled by default',
  environment => {
    process.env.REACT_APP_SENTRY_DSN = sentryDsn;
    process.env.REACT_APP_SENTRY_ENVIRONMENT = environment;

    expect(loadSentryOptions()).toMatchObject({
      dsn: sentryDsn,
      environment,
      integrations: [{ name: 'BrowserTracing' }, { name: 'Replay' }],
      tracesSampleRate: 0,
      tracePropagationTargets: [],
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    });
  }
);

it('reads the release, sample rates and propagation targets from the environment', () => {
  process.env.REACT_APP_SENTRY_DSN = sentryDsn;
  process.env.REACT_APP_SENTRY_RELEASE = 'parking-permits-ui@1.6.2';
  process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE = '0.1';
  process.env.REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE = '0.2';
  process.env.REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE = '0.5';
  process.env.REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS =
    'https://backend.example.com, https://other.example.com, ';

  expect(loadSentryOptions()).toMatchObject({
    release: 'parking-permits-ui@1.6.2',
    tracesSampleRate: 0.1,
    tracePropagationTargets: [
      'https://backend.example.com',
      'https://other.example.com',
    ],
    replaysSessionSampleRate: 0.2,
    replaysOnErrorSampleRate: 0.5,
  });
});

it('uses disabled defaults for empty sample rates and propagation targets', () => {
  process.env.REACT_APP_SENTRY_DSN = sentryDsn;
  process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE = '';
  process.env.REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE = '';
  process.env.REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE = '';
  process.env.REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS = '';

  expect(loadSentryOptions()).toMatchObject({
    tracesSampleRate: 0,
    tracePropagationTargets: [],
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
});
