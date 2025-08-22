import { render, screen } from '@testing-library/react';
import Footer from './Footer';
import { BrowserRouter } from 'react-router-dom';

describe('Footer', () => {
  it('renders the footer and contains rights reserved', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
  });
}); 