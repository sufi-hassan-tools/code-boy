import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Users from '../Users.jsx';

describe('Users Page', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );
  });
});
