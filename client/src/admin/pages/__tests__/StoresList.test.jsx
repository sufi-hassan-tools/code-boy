import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StoresList from '../StoresList.jsx';
import { getStores } from '../../../services/api.js';

jest.mock('../../../services/api.js', () => ({
  getStores: jest.fn(),
}));

describe('StoresList Page', () => {
  it('renders without crashing', () => {
    getStores.mockResolvedValue({ data: { stores: [], total: 0 } });
    render(
      <MemoryRouter>
        <StoresList />
      </MemoryRouter>
    );
  });
});
