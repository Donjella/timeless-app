import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, AlertTriangle, X, Check, Calendar } from 'lucide-react';
import { api } from '../utils/api';
import { getImagePlaceholder } from '../utils/imageUtils';
import { useAuthData } from '../hooks/useAuthData';
import '../styles/checkout.css';

const SimplifiedCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authData } = useAuthData();
  const [rental, setRental] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

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

  useEffect(() => {
    // Check authentication
    if (!authData.isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    const fetchRentalData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get rental ID from URL
        const urlParams = new URLSearchParams(location.search);
        const rentalId = urlParams.get('rental');

        if (!rentalId) {
          setError('No rental specified');
          setIsLoading(false);
          return;
        }

        // Fetch the rental details
        const rentalData = await api.rentals.getById(rentalId);

        if (!rentalData) {
          setError('Rental not found');
          setIsLoading(false);
          return;
        }

        // If rental is already paid, redirect to rentals page
        if (rentalData.isPaid) {
          navigate('/account/rentals');
          return;
        }

        console.log('Rental data loaded:', rentalData);
        setRental(rentalData);
      } catch (err) {
        console.error('Error fetching rental data:', err);
        setError('Failed to load rental information. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRentalData();
  }, [navigate, location, authData]);

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

  // Handle payment submission
  const handlePayment = async (e) => {
    e.preventDefault();

    // Validate form for credit card payment
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
      // Create a payment for the rental
      const paymentData = {
        rental_id: rental._id,
        amount: rental.total_rental_price,
        payment_method:
          paymentMethod === 'credit_card' ? 'Credit Card' : 'PayPal',
      };

      console.log('Submitting payment:', paymentData);
      const payment = await api.payments.create(paymentData);

      // Fetch the updated rental after payment
      const updatedRental = await api.rentals.getById(rental._id);

      // Set order details for success page
      setOrderDetails({
        orderId:
          Date.now().toString(36) +
          Math.random().toString(36).substring(2, 5).toUpperCase(),
        rental: updatedRental,
        payment: payment,
        total: rental.total_rental_price,
      });

      setOrderSuccess(true);
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(
        'Failed to process your payment. Please try again or contact customer support.'
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

  // Calculate rental days
  const calculateRentalDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
            <h1>Payment Confirmed!</h1>
            <p>Your rental payment has been successfully processed</p>
          </div>

          <div className="order-details">
            <div className="order-info">
              <h2>Payment Confirmation #{orderDetails.orderId}</h2>
              <p>A confirmation has been sent to your email.</p>
            </div>

            <div className="rental-summary">
              <h3>Rental Summary</h3>

              <div className="success-item">
                <div className="success-item-details">
                  <p className="success-item-title">
                    {orderDetails.rental.watch?.brand?.brand_name || 'Brand'}{' '}
                    {orderDetails.rental.watch?.model || 'Watch'}
                  </p>
                  <p className="success-item-dates">
                    <Calendar size={14} />
                    {formatDate(orderDetails.rental.rental_start_date)} -{' '}
                    {formatDate(orderDetails.rental.rental_end_date)}
                  </p>
                </div>
                <div className="success-item-price">
                  {formatCurrency(orderDetails.total)}
                </div>
              </div>

              <div className="success-total">
                <span>Total Amount Paid</span>
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
                onClick={() => navigate('/account/rentals')}
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
          <h1>Payment</h1>
          <div className="loading-message">Loading rental information...</div>
        </div>
      </div>
    );
  }

  // Error state with no rental
  if (!rental) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <h1>Payment</h1>
          <div className="error-message">
            <AlertTriangle size={20} />
            <span>{error || 'Rental information not available'}</span>
            <button
              onClick={() => navigate('/account/rentals')}
              className="btn-primary"
            >
              Back to My Rentals
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main payment form render
  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Complete Payment</h1>

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
            {/* Rental Overview Section */}
            <section className="checkout-section">
              <h2>Rental Overview</h2>
              <div className="summary-item">
                <div className="summary-item-image">
                  <img
                    src={rental.watch?.image_url || getImagePlaceholder()}
                    alt={rental.watch?.model || 'Watch'}
                    onError={(e) => {
                      console.log(
                        'Image failed to load:',
                        rental.watch?.image_url
                      );
                      e.target.onerror = null;
                      e.target.src = getImagePlaceholder();
                    }}
                  />
                </div>

                <div className="summary-item-details">
                  <p className="summary-item-title">
                    {rental.watch?.brand?.brand_name || 'Brand'}{' '}
                    {rental.watch?.model || 'Watch'}
                  </p>

                  <div className="date-display">
                    <p>
                      <strong>Start Date:</strong>{' '}
                      {formatDate(rental.rental_start_date)}
                    </p>
                    <p>
                      <strong>End Date:</strong>{' '}
                      {formatDate(rental.rental_end_date)}
                    </p>
                    <p>
                      <strong>Duration:</strong>{' '}
                      {calculateRentalDays(
                        rental.rental_start_date,
                        rental.rental_end_date
                      )}{' '}
                      days
                    </p>
                  </div>
                </div>

                <div className="summary-item-price">
                  {formatCurrency(rental.total_rental_price)}
                </div>
              </div>
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

            {/* Payment Action */}
            <div className="checkout-action">
              <button
                className="btn-primary checkout-button"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing
                  ? 'Processing...'
                  : `Pay ${formatCurrency(rental.total_rental_price)}`}
              </button>

              <p className="checkout-terms">
                By placing your order, you agree to our Terms of Service and
                Privacy Policy.
              </p>
            </div>
          </div>

          {/* Payment Summary Sidebar */}
          <div className="order-summary-sidebar">
            <div className="order-summary-card">
              <h2>Payment Summary</h2>

              <div className="order-totals">
                <div className="total-row">
                  <span>Rental Total</span>
                  <span>{formatCurrency(rental.total_rental_price)}</span>
                </div>

                <div className="total-row">
                  <span>Tax</span>
                  <span>{formatCurrency(0)}</span>
                </div>

                <div className="total-row grand-total">
                  <span>Total Due</span>
                  <span>{formatCurrency(rental.total_rental_price)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedCheckout;
