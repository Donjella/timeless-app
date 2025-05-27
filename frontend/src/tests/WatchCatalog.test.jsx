import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import WatchCatalog from '../components/WatchCatalog';
import { api } from '../utils/api';

// Mock API
vi.mock('../utils/api', () => ({
  api: {
    watches: {
      getAll: vi.fn(),
      getById: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    brands: {
      getAll: vi.fn(),
    },
    auth: {
      isAdmin: vi.fn(),
    },
  },
}));

// Mock react-router-dom useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock image placeholder utility
vi.mock('../utils/imageUtils', () => ({
  getImagePlaceholder: () => '/placeholder.jpg',
}));

describe('WatchCatalog Component', () => {
  // Sample data for tests
  const mockWatches = [
    {
      _id: 'watch1',
      model: 'Submariner',
      brand: { _id: 'brand1', brand_name: 'Rolex' },
      year: 2020,
      rental_day_price: 150,
      condition: 'Excellent',
      image_url: '/images/rolex-submariner.jpg',
      quantity: 3,
    },
    {
      _id: 'watch2',
      model: 'Speedmaster',
      brand: { _id: 'brand2', brand_name: 'Omega' },
      year: 2019,
      rental_day_price: 100,
      condition: 'Good',
      image_url: '/images/omega-speedmaster.jpg',
      quantity: 2,
    },
  ];

  const mockBrands = [
    { _id: 'brand1', brand_name: 'Rolex' },
    { _id: 'brand2', brand_name: 'Omega' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    api.watches.getAll.mockResolvedValue(mockWatches);
    api.brands.getAll.mockResolvedValue(mockBrands);

    // Clear localStorage
    localStorage.clear();
    sessionStorage.clear();
  });

  const renderWithMaxPriceSlider = async () => {
    render(
      <BrowserRouter>
        <WatchCatalog />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(api.watches.getAll).toHaveBeenCalled();
    });

    // Set slider to max to make sure all watches show
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 150 } });
  };

  it('should render the watch catalog with watches', async () => {
    await renderWithMaxPriceSlider();

    expect(screen.getByText(/Rolex Submariner/i)).toBeInTheDocument();
    expect(screen.getByText(/Omega Speedmaster/i)).toBeInTheDocument();
  });

  it('should not show admin buttons for regular users', async () => {
    localStorage.setItem(
      'auth',
      JSON.stringify({
        token: 'mock-token',
        user: { _id: 'user1', role: 'user' },
      })
    );

    await renderWithMaxPriceSlider();
    expect(screen.queryByText('Add New Watch')).not.toBeInTheDocument();
  });

  it('should show admin buttons for admin users', async () => {
    localStorage.setItem(
      'auth',
      JSON.stringify({
        token: 'mock-token',
        user: { _id: 'user1', role: 'admin' },
      })
    );

    await renderWithMaxPriceSlider();
    expect(screen.getByText('Add New Watch')).toBeInTheDocument();

    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should open watch details modal when view details is clicked', async () => {
    await renderWithMaxPriceSlider();
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);

    expect(screen.getByText(/Year:/i)).toBeInTheDocument();
    expect(screen.getByText(/Condition:/i)).toBeInTheDocument();
    expect(screen.getByText('Rent Now')).toBeInTheDocument();
  });

  it('should filter watches when a brand filter is applied', async () => {
    await renderWithMaxPriceSlider();
    const brandCheckbox = screen.getByLabelText('Rolex');
    fireEvent.click(brandCheckbox);

    expect(screen.getByText(/Rolex Submariner/i)).toBeInTheDocument();
    expect(screen.queryByText(/Omega Speedmaster/i)).not.toBeInTheDocument();
  });

  it('should navigate to checkout when rent now is clicked', async () => {
    localStorage.setItem(
      'auth',
      JSON.stringify({
        token: 'mock-token',
        user: { _id: 'user1', role: 'user' },
      })
    );

    await renderWithMaxPriceSlider();
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);

    const rentButton = screen.getByText('Rent Now');
    fireEvent.click(rentButton);

    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
    expect(sessionStorage.setItem).toHaveBeenCalled();
    const storedItems = JSON.parse(sessionStorage.setItem.mock.calls[0][1]);
    expect(storedItems[0].watchId).toBe('watch1');
  });

  it('should redirect to login when trying to rent while not logged in', async () => {
    localStorage.clear();

    await renderWithMaxPriceSlider();
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);

    const rentButton = screen.getByText('Rent Now');
    fireEvent.click(rentButton);
    expect(mockNavigate).toHaveBeenCalledWith('/login?redirect=/checkout');
  });

  it('should delete watch when admin clicks delete and confirms', async () => {
    localStorage.setItem(
      'auth',
      JSON.stringify({
        token: 'mock-token',
        user: { _id: 'user1', role: 'admin' },
      })
    );

    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);

    api.watches.delete.mockResolvedValue({ success: true });

    await renderWithMaxPriceSlider();
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(api.watches.delete).toHaveBeenCalledWith('watch1');
    });
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    confirmSpy.mockRestore();
  });
});
