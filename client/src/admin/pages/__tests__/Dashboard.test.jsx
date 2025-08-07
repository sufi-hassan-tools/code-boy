import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard.jsx';

describe('Dashboard Page', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
  });
});
