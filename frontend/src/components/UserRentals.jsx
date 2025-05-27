import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  CreditCard,
} from 'lucide-react';
import { api } from '../utils/api';
import { getImagePlaceholder } from '../utils/imageUtils';
import { useAuthData } from '../hooks/useAuthData';
import '../styles/user-rentals.css';

const UserRentals = () => {
  const navigate = useNavigate();
  const { authData } = useAuthData();
  const [rentals, setRentals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRental, setExpandedRental] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    // Check if user is logged in
    if (!authData.isAuthenticated) {
      navigate('/login?redirect=/account/rentals');
      return;
    }

    // Fetch user's rentals and payments
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Check if authentication is valid
        if (!api.auth.isAuthenticated()) {
          // Token expired or missing, redirect to login
          navigate('/login?redirect=/account/rentals&message=expired');
          return;
        }
        // Try to get rentals, handle 401 errors appropriately
        let rentalsData = [];
        try {
          rentalsData = await api.rentals.getUserRentals();
        } catch (err) {
          if (err.status === 401) {
            // Unauthorized - token likely expired
            localStorage.removeItem('auth');
            navigate('/login?redirect=/account/rentals&message=expired');
            return;
          }
          console.error('Error fetching rentals:', err);
          // Continue with empty rentals rather than failing completely
        }
        // Try to get payments, handle 401 errors appropriately
        let paymentsData = [];
        try {
          paymentsData = await api.payments.getUserPayments();
        } catch (err) {
          if (err.status === 401) {
            // Unauthorized - token likely expired
            localStorage.removeItem('auth');
            navigate('/login?redirect=/account/rentals&message=expired');
            return;
          }
          console.error('Error fetching payments:', err);
          // Continue with empty payments rather than failing completely
        }
        // Create a map of payment info by rental ID
        const paymentMap = {};
        paymentsData.forEach((payment) => {
          if (!payment || !payment.rental) return;
          const rentalId =
            typeof payment.rental === 'string'
              ? payment.rental
              : payment.rental._id;
          if (rentalId) {
            paymentMap[rentalId] = payment;
          }
        });
        // Enhance rentals with payment info
        const processedRentals = rentalsData
          .map((rental) => {
            if (!rental) return null;
            const payment = paymentMap[rental._id];
            return {
              ...rental,
              payment,
              isPaid: !!payment,
            };
          })
          .filter(Boolean);
        setRentals(processedRentals);
      } catch (err) {
        console.error('Error fetching user rentals:', err);
        setError('Failed to load your rental history. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [authData, navigate]);

  // Filter rentals based on active tab
  const filteredRentals = rentals.filter((rental) => {
    if (!rental) return false;

    const today = new Date();
    const endDate = new Date(rental.rental_end_date);

    if (activeTab === 'active') {
      // Active rentals: current date is before or equal to end date
      // and status is not Cancelled or Returned
      return (
        rental.rental_status !== 'Cancelled' &&
        rental.rental_status !== 'Returned' &&
        endDate >= today
      );
    } else if (activeTab === 'past') {
      // Past rentals: current date is after end date
      // or status is Cancelled or Returned
      return (
        rental.rental_status === 'Cancelled' ||
        rental.rental_status === 'Returned' ||
        endDate < today
      );
    }

    // All rentals
    return true;
  });

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'status-badge status-active';
      case 'Pending':
        return 'status-badge status-pending';
      case 'Confirmed':
        return 'status-badge status-confirmed';
      case 'Returned':
        return 'status-badge status-returned';
      case 'Cancelled':
        return 'status-badge status-cancelled';
      default:
        return 'status-badge';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate duration in days
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Toggle rental details view
  const toggleRentalDetails = (rentalId) => {
    if (expandedRental === rentalId) {
      setExpandedRental(null);
    } else {
      setExpandedRental(rentalId);
    }
  };

  return (
    <div className="user-rentals">
      <div className="rentals-container">
        <h1>My Rentals</h1>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="close-error">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="rentals-tabs">
          <button
            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active Rentals
          </button>
          <button
            className={`tab-button ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past Rentals
          </button>
          <button
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Rentals
          </button>
        </div>

        {isLoading ? (
          <div className="loading-message">Loading your rentals...</div>
        ) : filteredRentals.length === 0 ? (
          <div className="empty-state">
            {activeTab === 'active' ? (
              <>
                <h3>You have no active rentals</h3>
                <p>Browse our collection and rent a luxury watch today!</p>
                <button
                  className="browse-btn"
                  onClick={() => navigate('/catalog')}
                >
                  Browse Watches
                </button>
              </>
            ) : activeTab === 'past' ? (
              <>
                <h3>You have no past rentals</h3>
                <p>Once you complete a rental, it will appear here.</p>
              </>
            ) : (
              <>
                <h3>You haven&apos;t rented any watches yet</h3>
                <p>Browse our collection and rent a luxury watch today!</p>
                <button
                  className="browse-btn"
                  onClick={() => navigate('/catalog')}
                >
                  Browse Watches
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="rentals-list">
            {filteredRentals.map((rental) => (
              <div key={rental._id} className="rental-card">
                <div
                  className="rental-summary"
                  onClick={() => toggleRentalDetails(rental._id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleRentalDetails(rental._id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="rental-image">
                    <img
                      src={
                        rental.watch && rental.watch.image_url
                          ? rental.watch.image_url
                          : getImagePlaceholder()
                      }
                      alt={rental.watch?.model || 'Watch'}
                      onError={(e) => {
                        console.log(
                          'Image failed to load:',
                          rental.watch?.image_url
                        );
                        // If the image fails to load, set onError to null to prevent infinite loop
                        e.target.onerror = null;
                        // Use the data URI placeholder instead of trying to load another image
                        e.target.src = getImagePlaceholder();
                      }}
                    />
                  </div>

                  <div className="rental-info">
                    <h3>
                      {rental.watch?.brand?.brand_name || 'Brand'}{' '}
                      {rental.watch?.model || 'Watch'}
                    </h3>
                    <div className="rental-meta">
                      <div className="rental-dates">
                        <Clock size={14} />
                        <span>
                          {formatDate(rental.rental_start_date)} -{' '}
                          {formatDate(rental.rental_end_date)}
                        </span>
                        <span className="rental-duration">
                          (
                          {calculateDuration(
                            rental.rental_start_date,
                            rental.rental_end_date
                          )}{' '}
                          days)
                        </span>
                      </div>
                      <div className="rental-price">
                        {formatCurrency(rental.total_rental_price)}
                      </div>
                    </div>
                  </div>

                  <div className="rental-status">
                    <span className={getStatusBadgeClass(rental.rental_status)}>
                      {rental.rental_status}
                    </span>
                    <div className="rental-payment-status">
                      {rental.isPaid ? (
                        <span className="payment-badge payment-paid">Paid</span>
                      ) : (
                        <span className="payment-badge payment-unpaid">
                          Unpaid
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rental-collapse">
                    {expandedRental === rental._id ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </div>
                </div>

                {expandedRental === rental._id && (
                  <div className="rental-details">
                    <div className="details-section">
                      <h4>Rental Details</h4>
                      <div className="details-grid">
                        <div className="detail-item">
                          <span id={`rental-id-${rental._id}`}>Rental ID</span>
                          <span aria-labelledby={`rental-id-${rental._id}`}>
                            {rental._id}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span id={`start-date-${rental._id}`}>
                            Start Date
                          </span>
                          <span aria-labelledby={`start-date-${rental._id}`}>
                            {formatDate(rental.rental_start_date)}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span id={`end-date-${rental._id}`}>End Date</span>
                          <span aria-labelledby={`end-date-${rental._id}`}>
                            {formatDate(rental.rental_end_date)}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span id={`collection-${rental._id}`}>
                            Collection Method
                          </span>
                          <span aria-labelledby={`collection-${rental._id}`}>
                            {rental.collection_mode}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span id={`status-${rental._id}`}>Rental Status</span>
                          <span
                            className={getStatusBadgeClass(
                              rental.rental_status
                            )}
                            aria-labelledby={`status-${rental._id}`}
                          >
                            {rental.rental_status}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span id={`price-${rental._id}`}>Total Price</span>
                          <span aria-labelledby={`price-${rental._id}`}>
                            {formatCurrency(rental.total_rental_price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {rental.payment && (
                      <div className="details-section">
                        <h4>Payment Information</h4>
                        <div className="details-grid">
                          <div className="detail-item">
                            <span id={`payment-status-${rental._id}`}>
                              Payment Status
                            </span>
                            <span
                              className={`payment-badge ${rental.payment.payment_status === 'Completed' ? 'payment-paid' : 'payment-pending'}`}
                              aria-labelledby={`payment-status-${rental._id}`}
                            >
                              {rental.payment.payment_status}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span id={`amount-${rental._id}`}>Amount Paid</span>
                            <span aria-labelledby={`amount-${rental._id}`}>
                              {formatCurrency(rental.payment.amount)}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span id={`method-${rental._id}`}>
                              Payment Method
                            </span>
                            <span aria-labelledby={`method-${rental._id}`}>
                              {rental.payment.payment_method}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span id={`payment-date-${rental._id}`}>
                              Payment Date
                            </span>
                            <span
                              aria-labelledby={`payment-date-${rental._id}`}
                            >
                              {rental.payment.payment_date
                                ? formatDate(rental.payment.payment_date)
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span id={`transaction-${rental._id}`}>
                              Transaction ID
                            </span>
                            <span aria-labelledby={`transaction-${rental._id}`}>
                              {rental.payment.transaction_id || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="rental-actions">
                      {rental.rental_status === 'Pending' && !rental.isPaid && (
                        <button
                          className="action-btn pay-btn"
                          onClick={() =>
                            navigate(`/payment?rental=${rental._id}`)
                          }
                        >
                          <CreditCard size={16} />
                          Make Payment
                        </button>
                      )}

                      <button
                        className="action-btn view-watch-btn"
                        onClick={() =>
                          navigate(`/watches/${rental.watch?._id}`)
                        }
                      >
                        <Eye size={16} />
                        View Watch
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRentals;
