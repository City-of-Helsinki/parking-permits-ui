import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import LoginProvider from '../LoginProvider';

const {
  mockGetHDSClientConfig,
  mockCreateGraphQLClientModule,
  mockProviderProps,
} = vi.hoisted(() => ({
  mockGetHDSClientConfig: vi.fn(),
  mockCreateGraphQLClientModule: vi.fn(),
  mockProviderProps: vi.fn(),
}));

vi.mock('hds-react', () => ({
  LoginProvider: ({
    children,
    ...props
  }: {
    children: ReactNode;
    [key: string]: unknown;
  }) => {
    mockProviderProps(props);
    return <div data-testid="hds-login-provider">{children}</div>;
  },
}));

vi.mock('../index', () => ({
  getHDSClientConfig: mockGetHDSClientConfig,
}));

vi.mock('../../hooks/graphqlClientModule', () => ({
  createGraphQLClientModule: mockCreateGraphQLClientModule,
}));

beforeEach(() => {
  vi.resetAllMocks();
  mockGetHDSClientConfig.mockReturnValue({
    clientId: 'parking-permits',
    callbackPath: '/callback',
  });
  mockCreateGraphQLClientModule.mockReturnValue({ id: 'graphql-module' });
});

it('passes HDS config and a memoized GraphQL module to the provider', () => {
  const { rerender } = render(
    <LoginProvider>
      <span>Application content</span>
    </LoginProvider>
  );

  expect(screen.getByText('Application content')).toBeInTheDocument();
  expect(mockProviderProps).toHaveBeenLastCalledWith({
    clientId: 'parking-permits',
    callbackPath: '/callback',
    modules: [{ id: 'graphql-module' }],
  });
  expect(mockCreateGraphQLClientModule).toHaveBeenCalledOnce();

  rerender(
    <LoginProvider>
      <span>Updated content</span>
    </LoginProvider>
  );

  expect(screen.getByText('Updated content')).toBeInTheDocument();
  expect(mockCreateGraphQLClientModule).toHaveBeenCalledOnce();
});
