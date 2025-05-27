import React, { useState, useEffect } from 'react';
import { Filter as FilterIcon, Search, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import WatchModal from './WatchModal';
import { getImagePlaceholder } from '../utils/imageUtils';
import '../styles/watch-catalog.css';

const WatchCatalog = () => {
  const navigate = useNavigate();
  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWatch, setSelectedWatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWatch, setCurrentWatch] = useState(null);
  const [apiConnectionFailed, setApiConnectionFailed] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilters, setBrandFilters] = useState({});
  const [priceValue, setPriceValue] = useState(0);
  const [maxPrice, setMaxPrice] = useState(150);
  const [conditionFilter, setConditionFilter] = useState('Any');

  // Brand list for filters
  const [brands, setBrands] = useState([]);

  // Authentication state
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = () => {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      setIsAdmin(auth.user?.role === 'admin');
    };

    checkAdmin();
    window.addEventListener('storage', checkAdmin);

    return () => {
      window.removeEventListener('storage', checkAdmin);
    };
  }, []);

  // Fetch watches and brands on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;

      setLoading(true);
      setError(null);

      const timeoutId = setTimeout(() => {
        if (isMounted) {
          setError('Request timed out. The server may be unavailable.');
          setLoading(false);
          setApiConnectionFailed(true);
        }
      }, 15000);

      try {
        const [watchesData, brandsData] = await Promise.all([
          api.watches.getAll(),
          api.brands.getAll(),
        ]);

        clearTimeout(timeoutId);

        if (!isMounted) return;

        if (!Array.isArray(watchesData) || !Array.isArray(brandsData)) {
          throw new Error('Invalid data format received from server');
        }

        const initialBrandFilters = {};
        brandsData.forEach((brand) => {
          if (brand && brand._id) {
            initialBrandFilters[brand._id] = false;
          }
        });

        if (isMounted) {
          setWatches(watchesData);
          setBrands(brandsData);
          setBrandFilters(initialBrandFilters);

          if (watchesData.length > 0) {
            const highestPrice = Math.max(
              ...watchesData.map((w) => w.rental_day_price || 0)
            );
            setMaxPrice(highestPrice);
            setPriceValue(highestPrice);
          }

          setApiConnectionFailed(false);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (isMounted) {
          console.error('Error in fetchData:', err);
          setError(`Failed to fetch data: ${err.message || 'Unknown error'}`);
          setApiConnectionFailed(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle watch creation or update (for admin)
  const handleSaveWatch = async (watchData, mode) => {
    if (!watchData) {
      setError('No watch data provided');
      return;
    }

    setLoading(true);
    setError(null);

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setError('Request timed out. The server may be unavailable.');
      setLoading(false);
    }, 10000); // 10 second timeout

    try {
      let updatedWatch;

      if (mode === 'edit' && currentWatch) {
        updatedWatch = await api.watches.update(currentWatch._id, watchData);

        // Update watches list
        setWatches(
          watches.map((w) => (w._id === updatedWatch._id ? updatedWatch : w))
        );
      } else {
        updatedWatch = await api.watches.create(watchData);

        // Add to watches list
        setWatches([...watches, updatedWatch]);
      }

      clearTimeout(timeoutId);
      setIsModalOpen(false);
      setCurrentWatch(null);
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Error saving watch:', err);
      setError(err.message || 'Failed to save watch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle rental action (for users)
  const handleRent = (watch) => {
    if (!watch || !watch._id) return;

    // Check if user is logged in
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    if (!auth.token) {
      // Redirect to login page
      navigate('/login?redirect=/checkout');
      return;
    }

    // Prepare checkout item in session storage
    const checkoutItem = {
      watch: watch,
      watchId: watch._id,
      rentalDays: 3, // Default to 3 days, you might want to make this configurable
      startDate: new Date().toISOString(),
      total: watch.rental_day_price * 3, // Calculate total for default 3 days
    };

    // Store in sessionStorage for checkout process
    sessionStorage.setItem('checkoutItems', JSON.stringify([checkoutItem]));

    // Navigate to checkout
    navigate('/checkout');
  };

  // Filter watches based on filters
  const filteredWatches = watches.filter((watch) => {
    if (!watch) return false;

    // Search term filter
    const matchesSearch =
      searchTerm === '' ||
      watch.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (watch.brand?.brand_name &&
        watch.brand.brand_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    // Brand filter - if no brands are selected, show all
    const anyBrandSelected = Object.values(brandFilters).some(
      (selected) => selected
    );
    const matchesBrand = !anyBrandSelected || brandFilters[watch.brand?._id];

    // Price range filter
    const matchesPrice = watch.rental_day_price <= priceValue;

    // Condition filter
    const matchesCondition =
      conditionFilter === 'Any' || watch.condition === conditionFilter;

    return matchesSearch && matchesBrand && matchesPrice && matchesCondition;
  });

  // Toggle brand filter
  const toggleBrandFilter = (brandId) => {
    if (!brandId) return;

    setBrandFilters({
      ...brandFilters,
      [brandId]: !brandFilters[brandId],
    });
  };

  // View watch details
  const viewDetails = (watch) => {
    if (!watch) return;
    setSelectedWatch(watch);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');

    const resetBrandFilters = {};
    brands.forEach((brand) => {
      if (brand && brand._id) {
        resetBrandFilters[brand._id] = false;
      }
    });

    setBrandFilters(resetBrandFilters);
    setPriceValue(0);
    setConditionFilter('Any');
  };

  // If API connection completely failed, show a simplified view
  if (apiConnectionFailed) {
    return (
      <div className="watch-catalog-container">
        <h1>Watch Catalog</h1>
        <div className="api-error-message">
          <AlertCircle size={24} />
          <div>
            <h3>Connection Error</h3>
            <p>
              {error ||
                'Failed to connect to the server. Please try again later.'}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="watch-catalog-container">
      <h1>Watch Catalog</h1>

      <div className="search-row">
        <div className="search-box">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Search watches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isAdmin && (
          <button
            className="add-watch-btn"
            onClick={() => {
              setCurrentWatch(null);
              setIsModalOpen(true);
            }}
          >
            Add New Watch
          </button>
        )}
      </div>

      {error && !apiConnectionFailed && (
        <div className="error-message">
          {error}
          <button className="error-close" onClick={() => setError(null)}>
            ×
          </button>
        </div>
      )}

      <div className="catalog-layout">
        <div className="filters-sidebar">
          <div className="filter-header">
            <FilterIcon size={16} />
            <h3>Filters</h3>
            {(searchTerm ||
              Object.values(brandFilters).some((v) => v) ||
              priceValue > 0 ||
              conditionFilter !== 'Any') && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear All
              </button>
            )}
          </div>

          <div className="filter-section">
            <h4>Brand</h4>
            <div className="brand-options">
              {brands.map(
                (brand) =>
                  brand &&
                  brand._id && (
                    <div key={brand._id} className="brand-option">
                      <input
                        type="checkbox"
                        id={`brand-${brand._id}`}
                        checked={brandFilters[brand._id] || false}
                        onChange={() => toggleBrandFilter(brand._id)}
                      />
                      <label htmlFor={`brand-${brand._id}`}>
                        {brand.brand_name}
                      </label>
                    </div>
                  )
              )}
            </div>
          </div>

          <div className="filter-section">
            <h4>Price Range</h4>
            <input
              type="range"
              min="0"
              max={maxPrice}
              value={priceValue}
              onChange={(e) => setPriceValue(parseInt(e.target.value))}
              className="price-slider"
            />
            <div className="price-labels">
              <span>$0</span>
              <span>Max: ${priceValue}</span>
            </div>
          </div>

          <div className="filter-section">
            <h4>Condition</h4>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="condition-select"
            >
              <option value="Any">Any</option>
              <option value="New">New</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
        </div>

        <div className="watches-content">
          {loading ? (
            <div className="loading-message">Loading watches...</div>
          ) : filteredWatches.length === 0 ? (
            <div className="no-results-message">
              <p>No watches found matching your criteria.</p>
            </div>
          ) : (
            <div className="watches-list">
              {filteredWatches.map(
                (watch) =>
                  watch && (
                    <div key={watch._id} className="watch-card">
                      <div className="watch-image">
                        <img
                          src={watch.image_url || getImagePlaceholder()}
                          alt={`${watch.brand?.brand_name || 'Watch'} ${watch.model || ''}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getImagePlaceholder();
                          }}
                        />
                      </div>
                      <div className="watch-info">
                        <h3>
                          {watch.brand?.brand_name || 'Watch'} {watch.model}
                        </h3>
                        <p className="watch-price">
                          ${watch.rental_day_price}/day
                        </p>
                        {watch.quantity <= 0 && (
                          <span className="out-of-stock">Out of Stock</span>
                        )}
                        <button
                          className="view-details-btn"
                          onClick={() => viewDetails(watch)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Watch details modal */}
      {selectedWatch && (
        <div className="watch-details-modal">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setSelectedWatch(null)}
            >
              ×
            </button>
            <div className="watch-details">
              <div className="watch-details-image">
                <img
                  src={selectedWatch.image_url || getImagePlaceholder()}
                  alt={`${selectedWatch.brand?.brand_name || 'Watch'} ${selectedWatch.model || ''}`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getImagePlaceholder();
                  }}
                />
              </div>
              <div className="watch-details-info">
                <h2>
                  {selectedWatch.brand?.brand_name || 'Watch'}{' '}
                  {selectedWatch.model}
                </h2>
                <p>
                  <strong>Year:</strong> {selectedWatch.year}
                </p>
                <p>
                  <strong>Condition:</strong> {selectedWatch.condition}
                </p>
                <p>
                  <strong>Price:</strong> ${selectedWatch.rental_day_price}/day
                </p>
                <p>
                  <strong>Available:</strong> {selectedWatch.quantity}{' '}
                  {selectedWatch.quantity === 1 ? 'unit' : 'units'}
                </p>

                <div className="watch-actions">
                  <button
                    className="rent-btn"
                    onClick={() => handleRent(selectedWatch)}
                    disabled={selectedWatch.quantity < 1}
                  >
                    {selectedWatch.quantity < 1 ? 'Out of Stock' : 'Rent Now'}
                  </button>

                  {isAdmin && (
                    <div className="admin-actions">
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setCurrentWatch(selectedWatch);
                          setIsModalOpen(true);
                          setSelectedWatch(null);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={async () => {
                          if (
                            window.confirm(
                              `Are you sure you want to delete ${selectedWatch.brand?.brand_name || 'this watch'} ${selectedWatch.model}?`
                            )
                          ) {
                            try {
                              await api.watches.delete(selectedWatch._id);
                              setWatches(
                                watches.filter(
                                  (w) => w._id !== selectedWatch._id
                                )
                              );
                              setSelectedWatch(null);
                            } catch (err) {
                              console.error('Error deleting watch:', err);
                              setError(err.message || 'Failed to delete watch');
                            }
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Watch Modal for adding/editing */}
      {isModalOpen && (
        <WatchModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setCurrentWatch(null);
          }}
          watch={currentWatch}
          onSave={handleSaveWatch}
        />
      )}
    </div>
  );
};

export default WatchCatalog;
