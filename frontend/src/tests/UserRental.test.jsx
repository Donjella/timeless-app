import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import UserRentals from '../components/UserRentals';
import { useAuthData } from '../hooks/useAuthData';
import { api } from '../utils/api';

vi.mock('../hooks/useAuthData');
vi.mock('../utils/api', () => ({
  api: {
    auth: {
      isAuthenticated: vi.fn(() => true),
    },
    rentals: {
      getUserRentals: vi.fn(),
    },
    payments: {
      getUserPayments: vi.fn(),
    },
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../utils/imageUtils', () => ({
  getImagePlaceholder: vi.fn(() => 'placeholder-image-url'),
}));

describe('UserRentals Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuthData.mockReturnValue({
      authData: {
        isAuthenticated: true,
        user: { id: 'user123', first_name: 'John', last_name: 'Doe' },
      },
    });

    api.rentals.getUserRentals.mockResolvedValue([]);
    api.payments.getUserPayments.mockResolvedValue([]);
  });

  it('redirects to login if user is not authenticated', () => {
    useAuthData.mockReturnValue({
      authData: {
        isAuthenticated: false,
        user: null,
      },
    });

    render(
      <BrowserRouter>
        <UserRentals />
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      '/login?redirect=/account/rentals'
    );
  });

  it('displays loading state initially', () => {
    render(
      <BrowserRouter>
        <UserRentals />
      </BrowserRouter>
    );

    expect(screen.getByText(/Loading your rentals/i)).toBeInTheDocument();
  });

  it('displays empty state when user has no rentals', async () => {
    render(
      <BrowserRouter>
        <UserRentals />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(api.rentals.getUserRentals).toHaveBeenCalled();
    });

    expect(screen.getByText(/You have no active rentals/i)).toBeInTheDocument();
    const browseButton = screen.getByRole('button', {
      name: /Browse Watches/i,
    });
    expect(browseButton).toBeInTheDocument();
  });

  it('can switch between rental tabs', async () => {
    render(
      <BrowserRouter>
        <UserRentals />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(api.rentals.getUserRentals).toHaveBeenCalled();
    });

    const activeTab = screen.getAllByRole('button', {
      name: /Active Rentals/i,
    })[0];
    expect(activeTab).toHaveClass('active');

    const user = userEvent.setup();
    const pastTab = screen.getByRole('button', { name: /Past Rentals/i });
    await user.click(pastTab);

    expect(pastTab).toHaveClass('active');
    expect(activeTab).not.toHaveClass('active');
    expect(screen.getByText(/You have no past rentals/i)).toBeInTheDocument();

    const allTab = screen.getByRole('button', { name: /All Rentals/i });
    await user.click(allTab);

    expect(allTab).toHaveClass('active');
    expect(
      screen.getByText(/You haven't rented any watches yet/i)
    ).toBeInTheDocument();
  });

  it('displays user rentals when rentals exist', async () => {
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + 10);

    const mockRental = {
      _id: 'rental1',
      watch: {
        _id: 'watch1',
        model: 'Submariner',
        brand: { brand_name: 'Rolex' },
        image_url: '/images/rolex-submariner.jpg',
      },
      rental_start_date: currentDate.toISOString(),
      rental_end_date: futureDate.toISOString(),
      rental_status: 'Active',
      collection_mode: 'Pickup',
      total_rental_price: 1500,
    };

    api.rentals.getUserRentals.mockResolvedValue([mockRental]);
    console.log = vi.fn();

    render(
      <BrowserRouter>
        <UserRentals />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(api.rentals.getUserRentals).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(
        screen.queryByText(/Loading your rentals/i)
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Active Rentals/i)).toBeInTheDocument();
    expect(screen.getByText(/My Rentals/i)).toBeInTheDocument();
    expect(api.rentals.getUserRentals).toHaveBeenCalledTimes(1);
  });

  it('handles API errors gracefully', async () => {
    api.rentals.getUserRentals.mockRejectedValue({
      message: 'Failed to load your rental history',
    });

    render(
      <BrowserRouter>
        <UserRentals />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(api.rentals.getUserRentals).toHaveBeenCalled();
    });

    expect(screen.queryByText(/Loading your rentals/i)).not.toBeInTheDocument();
  });
});
