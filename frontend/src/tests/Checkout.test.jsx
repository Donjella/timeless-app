import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, vi, beforeEach, expect } from 'vitest';
import Checkout from '../components/Checkout';
import { AuthContext } from '../contexts/AuthContext';

// ✅ Mock API module
vi.mock('../utils/api', () => ({
  api: {
    rentals: {
      getById: vi.fn(),
      create: vi.fn(),
    },
    payments: {
      create: vi.fn(),
    },
  },
}));

// ✅ Mock image util
vi.mock('../utils/imageUtils', () => ({
  getImagePlaceholder: () => 'placeholder.jpg',
}));

// ✅ Mock router
const mockNavigate = vi.fn();
const mockLocation = { search: '' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

// ✅ Helper
const renderWithAuth = (ui, authData) => {
  return render(
    <AuthContext.Provider value={{ authData }}>
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/checkout" element={ui} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('Checkout Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('renders checkout page initially', async () => {
    const { api } = await import('../utils/api');
    // 🛠️ Simulate pending request
    api.rentals.getById.mockImplementation(() => new Promise(() => {}));

    renderWithAuth(<Checkout />, { isAuthenticated: true, user: {} });

    // Check for the Checkout heading instead of loading text
    const checkoutHeading = await screen.findByRole('heading', {
      name: /checkout/i,
    });
    expect(checkoutHeading).toBeTruthy();

    // You can also verify customer information section is rendered
    const customerInfoHeading = await screen.findByRole('heading', {
      name: /customer information/i,
    });
    expect(customerInfoHeading).toBeTruthy();
  });

  it('redirects to login if not authenticated', async () => {
    renderWithAuth(<Checkout />, { isAuthenticated: false });

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/login?redirect=/checkout')
    );
  });

  it('displays customer info if authenticated', async () => {
    sessionStorage.setItem(
      'checkoutItems',
      JSON.stringify([
        {
          watchId: 'abc123',
          watch: {
            model: 'Explorer',
            brand: { brand_name: 'Rolex' },
            rental_day_price: 100,
          },
        },
      ])
    );

    renderWithAuth(<Checkout />, {
      isAuthenticated: true,
      user: {
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com',
        phone_number: '0412345678',
        street_address: '123 Test St',
        suburb: 'Testville',
        state: 'VIC',
        postcode: '3000',
      },
    });

    await screen.findByText(/customer information/i);

    expect(screen.getByText('Jane Doe')).toBeTruthy();
    expect(screen.getByText('jane@example.com')).toBeTruthy();
    expect(screen.getByText('0412345678')).toBeTruthy();
  });

  it('shows validation errors for invalid card input', async () => {
    sessionStorage.setItem(
      'checkoutItems',
      JSON.stringify([
        {
          watchId: 'abc123',
          watch: {
            model: 'Explorer',
            brand: { brand_name: 'Rolex' },
            rental_day_price: 100,
          },
        },
      ])
    );

    renderWithAuth(<Checkout />, {
      isAuthenticated: true,
      user: { first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com' },
    });

    await screen.findByText(/checkout/i);

    const payButton = screen.getByRole('button', { name: /pay/i });
    fireEvent.click(payButton);

    expect(
      await screen.findByText(/please enter a valid card number/i)
    ).toBeTruthy();
    expect(screen.getByText(/please enter the cardholder name/i)).toBeTruthy();
    expect(screen.getByText(/please enter a valid expiry date/i)).toBeTruthy();
    expect(screen.getByText(/please enter a valid cvv/i)).toBeTruthy();
  });

  it('renders order summary with correct item count', async () => {
    sessionStorage.setItem(
      'checkoutItems',
      JSON.stringify([
        {
          watchId: 'watch1',
          watch: {
            model: 'Daytona',
            brand: { brand_name: 'Rolex' },
            rental_day_price: 150,
          },
        },
        {
          watchId: 'watch2',
          watch: {
            model: 'Speedmaster',
            brand: { brand_name: 'Omega' },
            rental_day_price: 120,
          },
        },
      ])
    );

    renderWithAuth(<Checkout />, {
      isAuthenticated: true,
      user: {
        first_name: 'Alice',
        last_name: 'Lee',
        email: 'alice@example.com',
      },
    });

    await screen.findAllByRole('heading', { name: /order summary/i });

    expect(screen.getByText(/order summary.*2 items/i)).toBeTruthy();
    expect(screen.getByText(/Rolex Daytona/i)).toBeTruthy();
    expect(screen.getByText(/Omega Speedmaster/i)).toBeTruthy();
  });

  it('switches between payment methods correctly', async () => {
    sessionStorage.setItem(
      'checkoutItems',
      JSON.stringify([
        {
          watchId: 'abc123',
          watch: {
            model: 'Submariner',
            brand: { brand_name: 'Rolex' },
            rental_day_price: 150,
          },
        },
      ])
    );

    renderWithAuth(<Checkout />, {
      isAuthenticated: true,
      user: {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john@example.com',
      },
    });

    // Wait for the checkout page to load
    await screen.findByText(/payment method/i);

    // Find payment option elements
    const paypalOption = screen.getByLabelText(/PayPal/i);

    // Switch to PayPal
    fireEvent.click(paypalOption);

    // Verify PayPal info text is displayed
    expect(screen.getByText(/you will be redirected to paypal/i)).toBeTruthy();

    // Verify credit card form inputs are not visible
    expect(screen.queryByLabelText(/card number/i)).toBeNull();

    // Switch back to credit card
    const creditCardOption = screen.getByLabelText(/Credit\/Debit Card/i);
    fireEvent.click(creditCardOption);

    // Verify credit card form is now visible
    expect(screen.getByLabelText(/card number/i)).toBeTruthy();
    expect(screen.getByLabelText(/cardholder name/i)).toBeTruthy();

    // Verify PayPal info is no longer shown
    expect(screen.queryByText(/you will be redirected to paypal/i)).toBeNull();
  });

  it('handles API errors during checkout submission', async () => {
    // Mock API failure
    const { api } = await import('../utils/api');
    api.rentals.create.mockRejectedValue(new Error('Watch is out of stock'));

    // Setup checkout items
    sessionStorage.setItem(
      'checkoutItems',
      JSON.stringify([
        {
          watchId: 'abc123',
          watch: {
            model: 'Submariner',
            brand: { brand_name: 'Rolex' },
            rental_day_price: 150,
          },
        },
      ])
    );

    renderWithAuth(<Checkout />, {
      isAuthenticated: true,
      user: {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john@example.com',
      },
    });

    // Wait for checkout page to load
    await screen.findByText(/payment method/i);

    // Fill in credit card details
    fireEvent.change(screen.getByLabelText(/card number/i), {
      target: { value: '4242 4242 4242 4242' },
    });

    fireEvent.change(screen.getByLabelText(/cardholder name/i), {
      target: { value: 'John Smith' },
    });

    fireEvent.change(screen.getByLabelText(/expiry date/i), {
      target: { value: '12/30' },
    });

    fireEvent.change(screen.getByLabelText(/cvv/i), {
      target: { value: '123' },
    });

    // Submit the form
    const payButton = screen.getByRole('button', { name: /pay/i });
    fireEvent.click(payButton);

    // Verify error message appears
    expect(
      await screen.findByText(/failed to process your order/i)
    ).toBeTruthy();
    expect(
      screen.getByText(/please try again or contact customer support/i)
    ).toBeTruthy();
  });
});
