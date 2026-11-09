import * as Sentry from '@sentry/react';

const mockEnv = vi.hoisted<Record<string, string>>(() => ({}));

vi.mock('./utils', () => ({
  getEnvValue: (key: string) => mockEnv[key],
}));

vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  browserTracingIntegration: vi.fn(() => ({ name: 'BrowserTracing' })),
  replayIntegration: vi.fn(() => ({ name: 'Replay' })),
}));
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({ render: vi.fn() })),
}));
vi.mock('./App', () => ({ default: () => null }));
vi.mock('./client/LoginProvider', () => ({ default: () => null }));
vi.mock('./hooks/permitProvider', () => ({ PermitProvider: () => null }));
vi.mock('./hooks/userProfileProvider', () => ({
  UserProfileProvider: () => null,
}));
vi.mock('./hooks/vehicleChangeErrorProvider', () => ({
  VehicleChangeErrorProvider: () => null,
}));
vi.mock('./i18n/i18n', () => ({}));
vi.mock('./reportWebVitals', () => ({ default: vi.fn() }));

const sentryDsn = 'https://public@example.com/1';
const sentryEnvKeys = [
  'DSN',
  'ENVIRONMENT',
  'RELEASE',
  'TRACES_SAMPLE_RATE',
  'TRACE_PROPAGATION_TARGETS',
  'REPLAYS_SESSION_SAMPLE_RATE',
  'REPLAYS_ON_ERROR_SAMPLE_RATE',
];

function setEnv(key: string, value: string) {
  mockEnv[`REACT_APP_SENTRY_${key}`] = value;
}

async function loadSentryOptions() {
  await import('./index');
  const [options] = vi.mocked(Sentry.init).mock.calls[0] || [];
  return options;
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  sentryEnvKeys.forEach(key => setEnv(key, ''));
});

it('does not initialize Sentry without a DSN', async () => {
  expect(await loadSentryOptions()).toBeUndefined();
});

it.each(['review', 'development', 'testing', 'staging', 'production'])(
  'initializes Sentry in %s with tracing and replays disabled by default',
  async environment => {
    setEnv('DSN', sentryDsn);
    setEnv('ENVIRONMENT', environment);

    expect(await loadSentryOptions()).toMatchObject({
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

it('reads the release, sample rates and propagation targets from the environment', async () => {
  setEnv('DSN', sentryDsn);
  setEnv('RELEASE', 'parking-permits-ui@1.6.2');
  setEnv('TRACES_SAMPLE_RATE', '0.1');
  setEnv('REPLAYS_SESSION_SAMPLE_RATE', '0.2');
  setEnv('REPLAYS_ON_ERROR_SAMPLE_RATE', '0.5');
  setEnv(
    'TRACE_PROPAGATION_TARGETS',
    'https://backend.example.com, https://other.example.com, '
  );

  expect(await loadSentryOptions()).toMatchObject({
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

it('uses disabled defaults for empty sample rates and propagation targets', async () => {
  setEnv('DSN', sentryDsn);

  expect(await loadSentryOptions()).toMatchObject({
    tracesSampleRate: 0,
    tracePropagationTargets: [],
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
});
