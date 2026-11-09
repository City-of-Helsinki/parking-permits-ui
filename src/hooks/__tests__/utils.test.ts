import { getApiTokensFromStorage } from 'hds-react';
import { createGraphQLClient } from '../../graphql/graphqlClient';

vi.mock('hds-react', () => ({ getApiTokensFromStorage: vi.fn() }));
vi.mock('../../graphql/graphqlClient', () => ({
  createGraphQLClient: vi.fn(),
}));

const permitsKey = 'parking-permits-api-test';
const profileKey = 'profile-api-test';

// The client is cached at module level, so each test needs a fresh module.
const loadGetGqlClient = async () => (await import('../utils')).getGqlClient;

describe('getGqlClient', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
  });

  it.each([
    ['there are no tokens', undefined],
    ['the parking permits token is missing', { [profileKey]: 'token-b' }],
    ['the profile token is missing', { [permitsKey]: 'token-a' }],
  ])('returns undefined when %s', async (_name, tokens) => {
    vi.mocked(getApiTokensFromStorage).mockReturnValue(tokens as never);
    const getGqlClient = await loadGetGqlClient();

    expect(getGqlClient()).toBeUndefined();
    expect(createGraphQLClient).not.toHaveBeenCalled();
  });

  it('creates the client with env url and tokens, and caches it', async () => {
    const client = { id: 'client-1' };
    vi.mocked(createGraphQLClient).mockReturnValue(client as never);
    vi.mocked(getApiTokensFromStorage).mockReturnValue({
      [permitsKey]: 'token-a',
      [profileKey]: 'token-b',
    });
    const getGqlClient = await loadGetGqlClient();

    expect(getGqlClient()).toBe(client);
    expect(getGqlClient()).toBe(client);
    expect(createGraphQLClient).toHaveBeenCalledTimes(1);
    expect(createGraphQLClient).toHaveBeenCalledWith(
      'https://localhost/graphql/',
      'token-a',
      'token-b'
    );
  });

  it('retries after a failed attempt once tokens become available', async () => {
    const client = { id: 'client-1' };
    vi.mocked(createGraphQLClient).mockReturnValue(client as never);
    vi.mocked(getApiTokensFromStorage).mockReturnValueOnce(undefined as never);
    const getGqlClient = await loadGetGqlClient();
    expect(getGqlClient()).toBeUndefined();

    vi.mocked(getApiTokensFromStorage).mockReturnValue({
      [permitsKey]: 'token-a',
      [profileKey]: 'token-b',
    });
    expect(getGqlClient()).toBe(client);
  });
});
