import { render, screen, fireEvent } from '@testing-library/react';
import ThemeCard from '../ThemeCard.jsx';

const theme = {
  _id: '1',
  name: 'Test Theme',
  description: 'A test theme',
  previewImage: 'test.png',
};

test('triggers callbacks on actions', () => {
  const onPreview = jest.fn();
  const onSelect = jest.fn();
  render(<ThemeCard theme={theme} onPreview={onPreview} onSelect={onSelect} />);
  fireEvent.click(screen.getByText('Preview'));
  expect(onPreview).toHaveBeenCalledWith('1');
  fireEvent.click(screen.getByText('Select'));
  expect(onSelect).toHaveBeenCalledWith('1');
});
