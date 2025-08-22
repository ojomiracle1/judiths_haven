// ProductList component test using React Testing Library
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductList from '../ProductList';

describe('ProductList Component', () => {
  it('renders a list of products', () => {
    const products = [
      { _id: '1', name: 'Product 1', price: 10, images: ['test.jpg'] },
      { _id: '2', name: 'Product 2', price: 20, images: ['test.jpg'] },
    ];
    render(<ProductList products={products} />);
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('renders empty state when no products', () => {
    render(<ProductList products={[]} />);
    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });
}); 