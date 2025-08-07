import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Users from '../Users.jsx';
import { getUsers } from '../../../services/api.js';

jest.mock('../../../services/api.js', () => ({
  getUsers: jest.fn(),
}));

describe('Users Page', () => {
  it('renders without crashing', () => {
    getUsers.mockResolvedValue({ data: { users: [], total: 0 } });
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );
  });
});
