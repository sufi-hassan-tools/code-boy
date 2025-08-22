import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../Footer.jsx';

describe('Footer', () => {
  it('renders logo and tagline', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Moohaar')).toBeInTheDocument();
    expect(screen.getByText('ویبسائٹ آج اور ابھی')).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
  });

  it('renders quick links section', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms')).toBeInTheDocument();
  });

  it('renders contact information', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('support@moohaar.pk')).toBeInTheDocument();
    expect(screen.getByText('+92 300 1234567')).toBeInTheDocument();
  });

  it('renders copyright notice', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    
    expect(screen.getByText('© Moohaar 2025. All rights reserved.')).toBeInTheDocument();
  });

  it('has correct link attributes', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    
    const emailLink = screen.getByText('support@moohaar.pk');
    expect(emailLink).toHaveAttribute('href', 'mailto:support@moohaar.pk');
    
    const phoneLink = screen.getByText('+92 300 1234567');
    expect(phoneLink).toHaveAttribute('href', 'https://wa.me/923001234567');
  });
});