import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Settings from '../Settings.jsx';

describe('Settings Page', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );
  });
});
