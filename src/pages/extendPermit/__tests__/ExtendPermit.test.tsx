import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import {
  extendPermit,
  getExtendedPriceList,
} from '../../../graphql/permitGqlClient';
import { PermitStateContext } from '../../../hooks/permitProvider';
import { PermitActions, ROUTES } from '../../../types';
import ExtendPermit from '../ExtendPermit';

vi.mock('../../../graphql/permitGqlClient', () => ({
  extendPermit: vi.fn(),
  getExtendedPriceList: vi.fn(),
}));

const mockExtend = vi.mocked(extendPermit);
const mockPrices = vi.mocked(getExtendedPriceList);

const context = {
  getPermits: vi.fn(() => [{ id: 'permit-1', maxExtensionMonthCount: 3 }]),
};

const renderPage = (permitId = 'permit-1') =>
  render(
    <MemoryRouter initialEntries={[`/extend/${permitId}`]}>
      <PermitStateContext.Provider value={context as unknown as PermitActions}>
        <Routes>
          <Route path="/extend/:permitId" element={<ExtendPermit />} />
          <Route path={ROUTES.VALID_PERMITS} element={<div>valid page</div>} />
        </Routes>
      </PermitStateContext.Provider>
    </MemoryRouter>
  );

const continueButton = () =>
  screen.getByRole('button', { name: /actionBtn.continue/ });

describe('ExtendPermit', () => {
  const openSpy = vi.fn();

  beforeEach(() => {
    mockExtend.mockReset();
    mockPrices.mockReset();
    openSpy.mockReset();
    vi.stubGlobal('open', openSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('redirects when the permit is not found', () => {
    renderPage('unknown');
    expect(screen.getByText('valid page')).toBeInTheDocument();
  });

  it('navigates back to valid permits', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /actionBtn.back/ }));
    expect(screen.getByText('valid page')).toBeInTheDocument();
  });

  it('does nothing on continue when no months are selected', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(continueButton());
    expect(mockExtend).not.toHaveBeenCalled();
  });

  it('fetches prices, shows the total and clears them when reset to zero', async () => {
    const user = userEvent.setup();
    mockPrices.mockResolvedValue([
      { price: 10, startDate: '2030-01-01', endDate: '2030-01-31' },
      { price: 5, startDate: '2030-02-01', endDate: '2030-02-28' },
    ] as never);
    renderPage();

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '2');

    await waitFor(() => expect(screen.getAllByText(/€/)).toHaveLength(3));
    expect(mockPrices).toHaveBeenLastCalledWith('permit-1', 2);
    expect(screen.getByText(/^15/)).toBeInTheDocument();

    await user.clear(input);
    await waitFor(() => expect(screen.queryAllByText(/€/)).toHaveLength(0));
  });

  it('shows an error when fetching prices fails', async () => {
    const user = userEvent.setup();
    mockPrices.mockRejectedValue('price failure');
    renderPage();

    await user.type(screen.getByRole('spinbutton'), '1');

    expect(await screen.findByText(/price failure/)).toBeInTheDocument();
  });

  it('opens the checkout url when extending succeeds', async () => {
    const user = userEvent.setup();
    mockPrices.mockResolvedValue([]);
    mockExtend.mockResolvedValue({ checkoutUrl: 'https://example.com' });
    renderPage();

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '2');
    await user.click(continueButton());

    await waitFor(() =>
      expect(openSpy).toHaveBeenCalledWith('https://example.com', '_self')
    );
    expect(mockExtend).toHaveBeenCalledWith('permit-1', 2);
  });

  it('shows an error and re-enables continue when no checkout url is returned', async () => {
    const user = userEvent.setup();
    mockPrices.mockResolvedValue([]);
    mockExtend.mockResolvedValue({ checkoutUrl: '' });
    renderPage();

    await user.type(screen.getByRole('spinbutton'), '1');
    await user.click(continueButton());

    expect(await screen.findByText('error')).toBeInTheDocument();
    expect(openSpy).not.toHaveBeenCalled();
    expect(continueButton()).toBeEnabled();
  });
});

it('blocks manually entered durations above the extension limit', () => {
  mockPrices.mockReset();
  mockExtend.mockReset();
  renderPage();
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '4' } });
  expect(continueButton()).toBeDisabled();
  expect(mockPrices).not.toHaveBeenCalled();
  expect(mockExtend).not.toHaveBeenCalled();
});

it('rejects fractional durations instead of truncating them', () => {
  mockPrices.mockReset();
  mockExtend.mockReset();
  renderPage();
  fireEvent.change(screen.getByRole('spinbutton'), {
    target: { value: '1.5' },
  });
  expect(continueButton()).toBeDisabled();
  expect(mockPrices).not.toHaveBeenCalled();
  expect(mockExtend).not.toHaveBeenCalled();
});
