import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  CreditCard,
  ShoppingBag,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  X,
} from 'lucide-react';
import { api } from '../utils/api';
import { getImagePlaceholder } from '../utils/imageUtils';
import { useAuthData } from '../hooks/useAuthData';
import '../styles/checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authData } = useAuthData();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [orderSummaryExpanded, setOrderSummaryExpanded] = useState(false);
  const [directRentalMode, setDirectRentalMode] = useState(false);

  // Payment details state
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState({});

  // Order success state
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Rental dates state
  const [rentalDates, setRentalDates] = useState([]);

  useEffect(() => {
    // Check authentication
    if (!authData.isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    const fetchCheckoutData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check for rental ID in URL (direct payment for existing rental)
        const urlParams = new URLSearchParams(location.search);
        const rentalId = urlParams.get('rental');

        if (rentalId) {
          // Set direct rental mode
          setDirectRentalMode(true);

          // Fetch the specific rental for payment
          const rental = await api.rentals.getById(rentalId);

          if (!rental) {
            throw new Error('Rental not found');
          }

          // Check if rental is already paid
          if (rental.isPaid) {
            navigate('/account/rentals');
            return;
          }

          // Format rental for checkout
          const checkoutItem = {
            watchId: rental.watch._id,
            watch: rental.watch,
            rentalDays: calculateRentalDays(
              rental.rental_start_date,
              rental.rental_end_date
            ),
            total: rental.total_rental_price,
            rentalId: rental._id, // Store the existing rental ID
          };

          setCheckoutItems([checkoutItem]);
          setTotalAmount(rental.total_rental_price);

          // Set rental dates
          setRentalDates([
            {
              watchId: rental.watch._id,
              startDate: new Date(rental.rental_start_date)
                .toISOString()
                .split('T')[0],
              endDate: new Date(rental.rental_end_date)
                .toISOString()
                .split('T')[0],
            },
          ]);
        } else {
          // Normal checkout flow from cart
          const storedItems = JSON.parse(
            sessionStorage.getItem('checkoutItems') || '[]'
          );

          if (storedItems.length === 0) {
            navigate('/catalog'); // Navigate to catalog instead of cart
            return;
          }

          // Initialize checkout items and rental dates
          const initializedItems = storedItems.map((item) => {
            const startDate = new Date().toISOString().split('T')[0];
            const endDate = (() => {
              const end = new Date();
              end.setDate(end.getDate() + 7); // Default 7 days
              return end.toISOString().split('T')[0];
            })();

            const rentalDays = calculateRentalDays(startDate, endDate);

            return {
              ...item,
              rentalDays,
              total: item.watch.rental_day_price * rentalDays,
            };
          });

          // Initialize rental dates
          const initialRentalDates = initializedItems.map((item) => ({
            watchId: item.watchId,
            startDate: new Date().toISOString().split('T')[0],
            endDate: (() => {
              const end = new Date();
              end.setDate(end.getDate() + 7);
              return end.toISOString().split('T')[0];
            })(),
          }));

          setCheckoutItems(initializedItems);
          setRentalDates(initialRentalDates);

          // Calculate total amount
          const total = initializedItems.reduce(
            (sum, item) => sum + item.total,
            0
          );
          setTotalAmount(total);
        }
      } catch (err) {
        console.error('Error fetching checkout data:', err);
        setError('Failed to load checkout information. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckoutData();
  }, [navigate, location, authData]);

  // Calculate days between two dates
  const calculateRentalDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Update rental dates for a specific item
  const updateRentalDates = (index, field, value) => {
    // Skip updates if in direct rental mode
    if (directRentalMode) return;

    const updatedDates = [...rentalDates];
    updatedDates[index] = {
      ...updatedDates[index],
      [field]: value,
    };

    // Ensure end date is not more than 3 months from start date
    const start = new Date(updatedDates[index].startDate);
    const end = new Date(updatedDates[index].endDate);
    const maxAllowedDate = new Date(start);
    maxAllowedDate.setMonth(start.getMonth() + 3);

    // If end date exceeds 3 months, adjust
    if (end > maxAllowedDate) {
      updatedDates[index].endDate = maxAllowedDate.toISOString().split('T')[0];
    }

    // Recalculate total for this item
    const item = checkoutItems[index];
    const rentalDays = calculateRentalDays(
      updatedDates[index].startDate,
      updatedDates[index].endDate
    );

    // Update checkout items with new total
    const updatedItems = [...checkoutItems];
    updatedItems[index] = {
      ...item,
      rentalDays,
      total: item.watch.rental_day_price * rentalDays,
    };

    setRentalDates(updatedDates);
    setCheckoutItems(updatedItems);

    // Recalculate total amount
    const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    setTotalAmount(newTotal);
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    // Reset form errors
    setFormErrors({});
  };

  // Handle payment form input change
  const handlePaymentDetailChange = (e) => {
    const { name, value } = e.target;

    // Apply input formatting for card number
    if (name === 'cardNumber') {
      const formatted = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim();

      setPaymentDetails({
        ...paymentDetails,
        cardNumber: formatted,
      });
      return;
    }

    // Apply input formatting for expiry date (MM/YY)
    if (name === 'expiryDate') {
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;

      if (cleaned.length > 2) {
        formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
      }

      setPaymentDetails({
        ...paymentDetails,
        expiryDate: formatted,
      });
      return;
    }

    // For other fields, just set the value
    setPaymentDetails({
      ...paymentDetails,
      [name]: value,
    });
  };

  // Validate payment form
  const validatePaymentForm = () => {
    const errors = {};

    if (paymentMethod === 'credit_card') {
      // Card number validation (remove spaces and check length)
      const cardNumber = paymentDetails.cardNumber.replace(/\s/g, '');
      if (!cardNumber || cardNumber.length < 15 || cardNumber.length > 16) {
        errors.cardNumber = 'Please enter a valid card number';
      }

      // Card name validation
      if (!paymentDetails.cardName.trim()) {
        errors.cardName = 'Please enter the cardholder name';
      }

      // Expiry date validation (MM/YY format)
      const expiryPattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
      if (!expiryPattern.test(paymentDetails.expiryDate)) {
        errors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
      } else {
        // Check if card is expired
        const [month, year] = paymentDetails.expiryDate.split('/');
        const expiryDate = new Date(
          2000 + parseInt(year),
          parseInt(month) - 1,
          1
        );
        const today = new Date();

        if (expiryDate < today) {
          errors.expiryDate = 'Card has expired';
        }
      }

      // CVV validation (3 or 4 digits)
      if (!/^[0-9]{3,4}$/.test(paymentDetails.cvv)) {
        errors.cvv = 'Please enter a valid CVV';
      }
    }

    return errors;
  };

  // Handle checkout submission
  const handleCheckout = async (e) => {
    e.preventDefault();

    // For credit card payment, validate form
    if (paymentMethod === 'credit_card') {
      const validationErrors = validatePaymentForm();
      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors);
        return;
      }
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create rentals for each item in checkout
      const rentals = [];

      for (let i = 0; i < checkoutItems.length; i++) {
        const item = checkoutItems[i];
        const rentalDate = rentalDates[i];

        // Check if this is an existing rental (from direct payment flow)
        if (item.rentalId) {
          // Process payment for existing rental
          const paymentData = {
            rental_id: item.rentalId,
            amount: item.total,
            payment_method:
              paymentMethod === 'credit_card' ? 'Credit Card' : 'PayPal',
          };

          const payment = await api.payments.create(paymentData);

          // Fetch the updated rental after payment
          const updatedRental = await api.rentals.getById(item.rentalId);

          rentals.push({
            rental: updatedRental,
            payment,
          });
        } else {
          // Create a new rental (original flow)
          const rentalData = {
            watch_id: item.watchId,
            rental_days: item.rentalDays,
            rental_start_date: new Date(rentalDate.startDate).toISOString(),
            rental_end_date: new Date(rentalDate.endDate).toISOString(),
            collection_mode: 'Pickup',
          };

          const rental = await api.rentals.create(rentalData);

          // Process payment for this rental
          const paymentData = {
            rental_id: rental._id,
            amount: item.total,
            payment_method:
              paymentMethod === 'credit_card' ? 'Credit Card' : 'PayPal',
          };

          const payment = await api.payments.create(paymentData);

          rentals.push({
            rental,
            payment,
          });
        }
      }

      // Clear cart after successful order
      localStorage.removeItem('rentalCart');
      sessionStorage.removeItem('checkoutItems');

      // Dispatch event to update cart count in header
      window.dispatchEvent(new Event('cartUpdated'));

      // Set order details for success page
      setOrderDetails({
        orderId:
          Date.now().toString(36) +
          Math.random().toString(36).substring(2, 5).toUpperCase(),
        rentals,
        total: totalAmount,
      });

      setOrderSuccess(true);
    } catch (err) {
      console.error('Error during checkout:', err);
      setError(
        'Failed to process your order. Please try again or contact customer support.'
      );
    } finally {
      setIsProcessing(false);
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

  // Render method with date selectors
  const renderCheckoutItem = (item, index) => {
    const rentalDate = rentalDates[index];

    return (
      <div key={index} className="summary-item">
        <div className="summary-item-image">
          <img
            src={item.watch.image_url || getImagePlaceholder()}
            alt={item.watch.model}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = getImagePlaceholder();
            }}
          />
        </div>

        <div className="summary-item-details">
          <p className="summary-item-title">
            {item.watch.brand?.brand_name || ''} {item.watch.model}
          </p>

          <div className="rental-dates-selector">
            {directRentalMode ? (
              // Display dates but don't allow editing for direct rentals
              <div className="date-display">
                <p>
                  <strong>Start Date:</strong>{' '}
                  {formatDate(rentalDate.startDate)}
                </p>
                <p>
                  <strong>End Date:</strong> {formatDate(rentalDate.endDate)}
                </p>
              </div>
            ) : (
              // Allow date editing for regular checkout
              <>
                <div className="date-input-group">
                  <label htmlFor={`start-date-${index}`}>Start Date:</label>
                  <input
                    id={`start-date-${index}`}
                    type="date"
                    value={rentalDate.startDate}
                    onChange={(e) =>
                      updateRentalDates(index, 'startDate', e.target.value)
                    }
                    min={new Date().toISOString().split('T')[0]}
                    max={(() => {
                      const maxDate = new Date();
                      maxDate.setMonth(maxDate.getMonth() + 3);
                      return maxDate.toISOString().split('T')[0];
                    })()}
                  />
                </div>

                <div className="date-input-group">
                  <label htmlFor={`end-date-${index}`}>End Date:</label>
                  <input
                    id={`end-date-${index}`}
                    type="date"
                    value={rentalDate.endDate}
                    onChange={(e) =>
                      updateRentalDates(index, 'endDate', e.target.value)
                    }
                    min={rentalDate.startDate}
                    max={(() => {
                      const maxDate = new Date(rentalDate.startDate);
                      maxDate.setMonth(maxDate.getMonth() + 3);
                      return maxDate.toISOString().split('T')[0];
                    })()}
                  />
                </div>
              </>
            )}
          </div>

          <p className="summary-item-rental">
            {item.rentalDays} days x{' '}
            {formatCurrency(item.watch.rental_day_price)}/day
          </p>

          <p className="summary-item-dates">
            <Calendar size={14} />
            {formatDate(rentalDate.startDate)} -{' '}
            {formatDate(rentalDate.endDate)}
          </p>
        </div>

        <div className="summary-item-price">{formatCurrency(item.total)}</div>
      </div>
    );
  };

  // Render order success page
  if (orderSuccess) {
    return (
      <div className="checkout-page">
        <div className="checkout-container success-container">
          <div className="success-header">
            <div className="success-icon">
              <Check size={32} />
            </div>
            <h1>Order Confirmed!</h1>
            <p>Your rental order has been successfully processed</p>
          </div>

          <div className="order-details">
            <div className="order-info">
              <h2>Order #{orderDetails.orderId}</h2>
              <p>A confirmation has been sent to your email.</p>
            </div>

            <div className="rental-summary">
              <h3>Rental Summary</h3>

              {orderDetails.rentals.map((item, index) => (
                <div key={index} className="success-item">
                  <div className="success-item-details">
                    <p className="success-item-title">
                      {checkoutItems[index].watch.brand?.brand_name}{' '}
                      {checkoutItems[index].watch.model}
                    </p>
                    <p className="success-item-dates">
                      <Calendar size={14} />
                      {formatDate(item.rental.rental_start_date)} -{' '}
                      {formatDate(item.rental.rental_end_date)}
                    </p>
                  </div>
                  <div className="success-item-price">
                    {formatCurrency(item.payment.amount)}
                  </div>
                </div>
              ))}

              <div className="success-total">
                <span>Total Amount</span>
                <span className="success-total-amount">
                  {formatCurrency(orderDetails.total)}
                </span>
              </div>
            </div>

            <div className="next-steps">
              <h3>Next Steps</h3>
              <p>
                Your watch is ready for pickup at our store. Please bring your
                ID for verification.
              </p>
              <p>Store Address: 123 Watch Street, Melbourne, VIC 3000</p>
              <p>Opening Hours: Mon-Fri 9am-5pm, Sat 10am-4pm</p>
            </div>

            <div className="success-actions">
              <button
                className="btn-secondary"
                onClick={() => navigate('/account/profile')}
              >
                View My Rentals
              </button>

              <button
                className="btn-primary"
                onClick={() => navigate('/catalog')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <h1>Checkout</h1>
          <div className="loading-message">Loading checkout information...</div>
        </div>
      </div>
    );
  }

  // Main checkout render method
  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>{directRentalMode ? 'Complete Payment' : 'Checkout'}</h1>

        {error && (
          <div className="error-message">
            <AlertTriangle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="close-error">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="checkout-grid">
          <div className="checkout-main">
            {/* Customer Information Section */}
            <section className="checkout-section">
              <h2>Customer Information</h2>

              {authData.isAuthenticated && authData.user ? (
                <div className="customer-info">
                  <div className="info-row">
                    <span id="name-label" className="info-label">
                      Name:
                    </span>
                    <span aria-labelledby="name-label" className="info-value">
                      {authData.user.first_name} {authData.user.last_name}
                    </span>
                  </div>

                  <div className="info-row">
                    <span id="email-label" className="info-label">
                      Email:
                    </span>
                    <span aria-labelledby="email-label" className="info-value">
                      {authData.user.email}
                    </span>
                  </div>

                  <div className="info-row">
                    <span id="phone-label" className="info-label">
                      Phone:
                    </span>
                    <span aria-labelledby="phone-label" className="info-value">
                      {authData.user.phone_number || 'Not provided'}
                    </span>
                  </div>

                  {authData.user.street_address && (
                    <div className="info-row">
                      <span id="address-label" className="info-label">
                        Address:
                      </span>
                      <span
                        aria-labelledby="address-label"
                        className="info-value"
                      >
                        {authData.user.street_address}, {authData.user.suburb},{' '}
                        {authData.user.state} {authData.user.postcode}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="customer-info-placeholder">
                  <p>Please login to continue checkout</p>
                  <button
                    className="btn-primary"
                    onClick={() => navigate('/login?redirect=/checkout')}
                  >
                    Login or Register
                  </button>
                </div>
              )}
            </section>

            {/* Payment Method Section */}
            <section className="checkout-section">
              <h2>Payment Method</h2>

              <div className="payment-methods">
                <div className="payment-method-option">
                  <input
                    type="radio"
                    id="credit_card"
                    name="payment_method"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={() => handlePaymentMethodChange('credit_card')}
                  />
                  <label htmlFor="credit_card">
                    <CreditCard size={20} />
                    <span>Credit/Debit Card</span>
                  </label>
                </div>

                <div className="payment-method-option">
                  <input
                    type="radio"
                    id="paypal"
                    name="payment_method"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={() => handlePaymentMethodChange('paypal')}
                  />
                  <label htmlFor="paypal">
                    <span className="icon">P</span>
                    <span>PayPal</span>
                  </label>
                </div>
              </div>

              {paymentMethod === 'credit_card' && (
                <form className="payment-form">
                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentDetails.cardNumber}
                      onChange={handlePaymentDetailChange}
                      maxLength="19"
                      className={formErrors.cardNumber ? 'error' : ''}
                    />
                    {formErrors.cardNumber && (
                      <p className="error-text">{formErrors.cardNumber}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="cardName">Cardholder Name</label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      placeholder="John Doe"
                      value={paymentDetails.cardName}
                      onChange={handlePaymentDetailChange}
                      className={formErrors.cardName ? 'error' : ''}
                    />
                    {formErrors.cardName && (
                      <p className="error-text">{formErrors.cardName}</p>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="expiryDate">Expiry Date</label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={paymentDetails.expiryDate}
                        onChange={handlePaymentDetailChange}
                        maxLength="5"
                        className={formErrors.expiryDate ? 'error' : ''}
                      />
                      {formErrors.expiryDate && (
                        <p className="error-text">{formErrors.expiryDate}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="cvv">CVV</label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        placeholder="123"
                        value={paymentDetails.cvv}
                        onChange={handlePaymentDetailChange}
                        maxLength="4"
                        className={formErrors.cvv ? 'error' : ''}
                      />
                      {formErrors.cvv && (
                        <p className="error-text">{formErrors.cvv}</p>
                      )}
                    </div>
                  </div>
                </form>
              )}

              {paymentMethod === 'paypal' && (
                <div className="paypal-info">
                  <p>
                    You will be redirected to PayPal to complete your payment
                    after you place your order.
                  </p>
                </div>
              )}
            </section>

            {/* Order Summary (mobile only) */}
            <div className="order-summary-mobile">
              <div
                className="order-summary-header"
                onClick={() => setOrderSummaryExpanded(!orderSummaryExpanded)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setOrderSummaryExpanded(!orderSummaryExpanded);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="summary-title">
                  <ShoppingBag size={18} />
                  <h3>Order Summary ({checkoutItems.length} items)</h3>
                </div>
                <div className="summary-total">
                  {formatCurrency(totalAmount)}
                </div>
                <div className="summary-toggle">
                  {orderSummaryExpanded ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
              </div>

              {orderSummaryExpanded && (
                <div className="order-summary-content">
                  {checkoutItems.map((item, index) =>
                    renderCheckoutItem(item, index)
                  )}
                </div>
              )}
            </div>

            {/* Checkout Action */}
            <div className="checkout-action">
              <button
                className="btn-primary checkout-button"
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing
                  ? 'Processing...'
                  : `Pay ${formatCurrency(totalAmount)}`}
              </button>

              <p className="checkout-terms">
                By placing your order, you agree to our Terms of Service and
                Privacy Policy.
              </p>
            </div>
          </div>

          {/* Order Summary (desktop) */}
          <div className="order-summary-sidebar">
            <div className="order-summary-card">
              <h2>Order Summary</h2>

              <div className="order-items">
                {checkoutItems.map((item, index) =>
                  renderCheckoutItem(item, index)
                )}
              </div>

              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>

                <div className="total-row">
                  <span>Tax</span>
                  <span>{formatCurrency(0)}</span>
                </div>

                <div className="total-row grand-total">
                  <span>Total</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
