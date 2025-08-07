import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ThemeAdmin from '../ThemeAdmin.jsx';

describe('ThemeAdmin Page', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <ThemeAdmin />
      </MemoryRouter>
    );
  });
});
