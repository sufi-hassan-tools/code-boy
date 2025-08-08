import { render, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Users from '../Users.jsx';
import { getUsers } from '../../../services/api.js';

jest.mock('../../../services/api.js', () => ({
  getUsers: jest.fn(),
}));

jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('Users Page', () => {
  it('renders without crashing', async () => {
    getUsers.mockResolvedValue({ data: { users: [], total: 0 } });
    await act(async () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Users />
        </MemoryRouter>
      );
    });
    await waitFor(() => expect(getUsers).toHaveBeenCalled());
  });
});
