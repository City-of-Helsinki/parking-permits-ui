import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { addTemporaryVehicleToPermit } from '../../../graphql/permitGqlClient';
import { PermitStateContext } from '../../../hooks/permitProvider';
import { PermitActions, ROUTES } from '../../../types';
import TemporaryVehicle from '../TemporaryVehicle';

vi.mock('../../../graphql/permitGqlClient', () => ({
  addTemporaryVehicleToPermit: vi.fn(),
}));

const mockAdd = vi.mocked(addTemporaryVehicleToPermit);

const createContext = () => ({
  getPermits: vi.fn(() => [{ id: 'permit-1', endTime: '2099-01-01' }]),
  fetchPermits: vi.fn(),
});

const renderPage = (
  context: ReturnType<typeof createContext>,
  permitId = 'permit-1'
) =>
  render(
    <MemoryRouter initialEntries={[`/temp/${permitId}`]}>
      <PermitStateContext.Provider value={context as unknown as PermitActions}>
        <Routes>
          <Route path="/temp/:permitId" element={<TemporaryVehicle />} />
          <Route path={ROUTES.VALID_PERMITS} element={<div>valid page</div>} />
        </Routes>
      </PermitStateContext.Provider>
    </MemoryRouter>
  );

const continueButton = () =>
  screen.getByRole('button', { name: /actionBtn.continue/ });

const typeRegistration = async (
  user: ReturnType<typeof userEvent.setup>,
  value: string
) => user.type(screen.getByRole('textbox', { name: /registration/ }), value);

describe('TemporaryVehicle', () => {
  beforeEach(() => {
    mockAdd.mockReset();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2030, 0, 15, 10, 30));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('redirects when the permit is not found', () => {
    renderPage(createContext(), 'unknown');
    expect(screen.getByText('valid page')).toBeInTheDocument();
  });

  it('enables continue only with a registration, uppercased', async () => {
    const user = userEvent.setup();
    renderPage(createContext());

    expect(continueButton()).toBeDisabled();
    await typeRegistration(user, 'abc');
    expect(screen.getByDisplayValue('ABC')).toBeInTheDocument();
    expect(continueButton()).toBeEnabled();
  });

  it('submits, refreshes permits and navigates on success', async () => {
    const user = userEvent.setup();
    const context = createContext();
    mockAdd.mockResolvedValue(undefined as never);
    renderPage(context);

    await typeRegistration(user, 'abc');
    await user.click(continueButton());

    await waitFor(() =>
      expect(screen.getByText('valid page')).toBeInTheDocument()
    );
    expect(mockAdd).toHaveBeenCalledWith(
      'permit-1',
      'ABC',
      expect.any(String),
      expect.any(String)
    );
    expect(context.fetchPermits).toHaveBeenCalled();
  });

  it('shows an error and stays on the page when submit fails', async () => {
    const user = userEvent.setup();
    const context = createContext();
    mockAdd.mockRejectedValue('test failure');
    renderPage(context);

    await typeRegistration(user, 'abc');
    await user.click(continueButton());

    expect(await screen.findByText('test failure')).toBeInTheDocument();
    expect(context.fetchPermits).not.toHaveBeenCalled();
    expect(screen.queryByText('valid page')).not.toBeInTheDocument();
  });

  it('navigates back on cancel', async () => {
    const user = userEvent.setup();
    renderPage(createContext());

    await user.click(screen.getByRole('button', { name: /actionBtn.cancel/ }));
    expect(screen.getByText('valid page')).toBeInTheDocument();
  });
});
