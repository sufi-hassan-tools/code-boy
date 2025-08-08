import { render, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Settings from '../Settings.jsx';

jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('Settings Page', () => {
  it('renders without crashing', async () => {
    let result;
    await act(async () => {
      result = render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Settings />
        </MemoryRouter>
      );
    });
    await waitFor(() => expect(result.container).toBeInTheDocument());
  });
});
