import { act, renderHook, waitFor } from '@testing-library/react';
import { getApiTokensFromStorage } from 'hds-react';
import { useIsAuthorizationReady } from '../../client/useIsAuthReady';
import myProfileQueryDocument from '../../graphql/myProfileQuery';
import updateLanguageDocument from '../../graphql/updateLanguage';
import { getGqlClient } from '../graphqlClientModule';
import useProfile from '../useProfile';

const { mockChangeLanguage, mockI18n } = vi.hoisted(() => {
  const mockChangeLanguage = vi.fn();
  return {
    mockChangeLanguage,
    mockI18n: { language: 'fi', changeLanguage: mockChangeLanguage },
  };
});

vi.mock('hds-react', async importOriginal => ({
  ...(await importOriginal<typeof import('hds-react')>()),
  getApiTokensFromStorage: vi.fn(),
}));

vi.mock('react-i18next', async importOriginal => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: mockI18n,
  }),
}));

vi.mock('../../client/useIsAuthReady', () => ({
  useIsAuthorizationReady: vi.fn(),
}));

vi.mock('../graphqlClientModule', () => ({
  getGqlClient: vi.fn(),
}));

const mockTokens = vi.mocked(getApiTokensFromStorage);
const mockAuthReady = vi.mocked(useIsAuthorizationReady);
const mockGetClient = vi.mocked(getGqlClient);

const address = {
  id: 'address-1',
  streetName: 'Test Street',
  streetNameSv: 'Test Street',
  streetNumber: 1,
  city: 'Helsinki',
  citySv: 'Helsingfors',
  postalCode: '00100',
  primary: true,
};

const profile = {
  id: 'profile-1',
  age: 30,
  email: 'alex@example.com',
  firstName: 'Alex',
  lastName: 'Example',
  language: 'sv',
  phoneNumber: '',
  primaryAddress: address,
  primaryAddressApartment: '',
  primaryAddressApartmentSv: '',
  otherAddress: { ...address, id: 'address-2' },
  otherAddressApartment: '',
  otherAddressApartmentSv: '',
  token: 'profile-token',
};

const createClient = () => ({
  query: vi.fn(),
  mutate: vi.fn(),
});

beforeEach(() => {
  vi.resetAllMocks();
  mockTokens.mockReturnValue(null);
  mockAuthReady.mockReturnValue([false, false]);
  mockGetClient.mockReturnValue(undefined);
});

it('waits without tokens and does not query the profile', () => {
  const { result } = renderHook(() => useProfile());

  expect(result.current.getStatus()).toBe('waiting');
  expect(result.current.getProfile()).toBeUndefined();
  expect(mockAuthReady).toHaveBeenCalledOnce();
});

it('loads the profile, addresses, and language when a client is available', async () => {
  const client = createClient();
  client.query.mockResolvedValue({ data: { profile } });
  mockTokens.mockReturnValue({ 'profile-token': 'token' });
  mockGetClient.mockReturnValue(client as never);
  mockAuthReady.mockReturnValue([true, false]);

  const { result } = renderHook(() => useProfile());

  await waitFor(() => expect(result.current.getStatus()).toBe('loaded'));

  expect(client.query).toHaveBeenCalledWith({
    errorPolicy: 'all',
    query: myProfileQueryDocument,
  });
  expect(result.current.getProfile()).toEqual(profile);
  expect(result.current.getAddresses()).toEqual([
    profile.primaryAddress,
    profile.otherAddress,
  ]);
  expect(result.current.getLanguage()).toBe('sv');
  expect(mockChangeLanguage).toHaveBeenCalledWith('sv');
  expect(result.current.getErrorMessage()).toBeUndefined();
  expect(mockGetClient.mock.results.length).toBeGreaterThan(1);
  expect(
    mockGetClient.mock.results.every(({ value }) => value === client)
  ).toBe(true);
  expect(client.query).toHaveBeenCalledOnce();
});

it('reports GraphQL errors and leaves the profile unloaded', async () => {
  const client = createClient();
  client.query.mockResolvedValue({
    errors: [{ message: 'Profile unavailable' }],
    data: {},
  });
  mockTokens.mockReturnValue({ 'profile-token': 'token' });
  mockGetClient.mockReturnValue(client as never);
  mockAuthReady.mockReturnValue([true, false]);

  const { result } = renderHook(() => useProfile());

  await waitFor(() => expect(result.current.getStatus()).toBe('error'));

  expect(result.current.getProfile()).toBeUndefined();
  expect(result.current.getErrorMessage()).toBe('Profile unavailable');
  expect(mockChangeLanguage).not.toHaveBeenCalled();
});

it('updates the language through the GraphQL client', () => {
  const client = createClient();
  mockGetClient.mockReturnValue(client as never);

  const { result } = renderHook(() => useProfile());
  act(() => result.current.updateLanguage('sv'));

  expect(client.mutate).toHaveBeenCalledWith({
    mutation: updateLanguageDocument,
    variables: { lang: 'sv' },
    errorPolicy: 'all',
  });
});
