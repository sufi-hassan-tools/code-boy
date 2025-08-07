import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import StoresList from '../StoresList.jsx';

jest.mock('axios');

describe('StoresList Page', () => {
  it('renders without crashing', () => {
    axios.get.mockResolvedValue({ data: { stores: [], total: 0 } });
    render(
      <MemoryRouter>
        <StoresList />
      </MemoryRouter>
    );
  });
});
