import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import UserList from '../UserList';

const mockStore = configureStore([]);

describe('Admin UserList Page', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      user: {
        users: [
          { _id: '1', name: 'Test User', email: 'test@example.com' },
          { _id: '2', name: 'Another User', email: 'another@example.com' },
        ],
        isLoading: false,
        isError: false,
        message: '',
      },
    });
  });

  it('renders the Users heading', () => {
    render(
      <Provider store={store}>
        <UserList />
      </Provider>
    );
    expect(screen.getByText(/Users/i)).toBeInTheDocument();
  });

  it('renders user names and emails', () => {
    render(
      <Provider store={store}>
        <UserList />
      </Provider>
    );
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Another User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('another@example.com')).toBeInTheDocument();
  });

  it('renders Add New User button', () => {
    render(
      <Provider store={store}>
        <UserList />
      </Provider>
    );
    expect(screen.getByText(/Add New User/i)).toBeInTheDocument();
  });
}); 