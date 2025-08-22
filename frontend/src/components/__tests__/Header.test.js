// Header component test using React Testing Library
import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header Component', () => {
  it('renders the logo', () => {
    render(<Header />);
    expect(screen.getByAltText(/logo/i)).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/cart/i)).toBeInTheDocument();
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });
}); 