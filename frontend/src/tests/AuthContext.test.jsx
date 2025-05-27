import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AuthProvider } from '../contexts/AuthProvider';
import { useAuthData } from '../hooks/useAuthData';

// Mock isTokenExpired utility function
vi.mock('../utils/tokenUtils', () => ({
  isTokenExpired: vi.fn(),
}));

// Create a test component that uses the AuthContext
const TestComponent = () => {
  const { authData, login, logout, isAdmin, isTokenValid } = useAuthData();

  return (
    <div>
      <div data-testid="auth-status">
        {authData.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user-info">
        {authData.user
          ? `${authData.user.first_name} ${authData.user.last_name}`
          : 'No User'}
      </div>
      <div data-testid="admin-status">{isAdmin() ? 'Admin' : 'Not Admin'}</div>
      <div data-testid="token-status">
        {isTokenValid() ? 'Token Valid' : 'Token Invalid'}
      </div>
      <button
        onClick={() =>
          login({
            _id: 'user123',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            phone_number: '1234567890',
            role: 'user',
            token: 'valid-token',
          })
        }
      >
        Login
      </button>
      <button
        onClick={() =>
          login({
            _id: 'admin123',
            first_name: 'Admin',
            last_name: 'User',
            email: 'admin@example.com',
            phone_number: '0987654321',
            role: 'admin',
            token: 'admin-token',
          })
        }
      >
        Login as Admin
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key]),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

describe('AuthContext', () => {
  // Setup and teardown
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });

    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Not Authenticated'
    );
    expect(screen.getByTestId('user-info')).toHaveTextContent('No User');
    expect(screen.getByTestId('admin-status')).toHaveTextContent('Not Admin');
    expect(screen.getByTestId('token-status')).toHaveTextContent(
      'Token Invalid'
    );
  });

  it('updates context and localStorage when user logs in', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const user = userEvent.setup();
    const loginButton = screen.getByText('Login');

    await user.click(loginButton);

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Authenticated'
    );
    expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('admin-status')).toHaveTextContent('Not Admin');

    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalled();
    const storedAuth = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(storedAuth.isAuthenticated).toBe(true);
    expect(storedAuth.user.first_name).toBe('John');
    expect(storedAuth.user.role).toBe('user');
  });

  it('correctly identifies admin users', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const user = userEvent.setup();
    const adminLoginButton = screen.getByText('Login as Admin');

    await user.click(adminLoginButton);

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Authenticated'
    );
    expect(screen.getByTestId('user-info')).toHaveTextContent('Admin User');
    expect(screen.getByTestId('admin-status')).toHaveTextContent('Admin');
  });

  it('clears authentication state on logout', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const user = userEvent.setup();

    // First login
    await user.click(screen.getByText('Login'));
    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Authenticated'
    );

    // Then logout
    await user.click(screen.getByText('Logout'));

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Not Authenticated'
    );
    expect(screen.getByTestId('user-info')).toHaveTextContent('No User');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth');
  });

  it('loads authentication state from localStorage on initialization', async () => {
    // Set mock localStorage with auth data
    const mockAuthData = {
      isAuthenticated: true,
      user: {
        id: 'user123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        role: 'user',
      },
      token: 'valid-token',
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));

    // Mock token as valid
    const { isTokenExpired } = await import('../utils/tokenUtils');
    isTokenExpired.mockReturnValue(false);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Verify the auth state is loaded from localStorage
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'Authenticated'
      );
      expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe');
    });
  });

  it('logs out user when stored token is expired', async () => {
    // Set mock localStorage with auth data that has an expired token
    const mockAuthData = {
      isAuthenticated: true,
      user: {
        id: 'user123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        role: 'user',
      },
      token: 'expired-token',
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));

    // Mock token as expired
    const { isTokenExpired } = await import('../utils/tokenUtils');
    isTokenExpired.mockReturnValue(true);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Verify the user is logged out due to expired token
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'Not Authenticated'
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth');
    });
  });
});
