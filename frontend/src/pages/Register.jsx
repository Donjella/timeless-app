// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthData } from '../hooks/useAuthData';
import { api } from '../utils/api';
import '../styles/register.css';

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuthData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    street_address: '',
    suburb: '',
    state: '',
    postcode: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim())
      newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim())
      newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Email is invalid';

    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // ✅ Phone number validation (optional but must be valid if provided)
    if (formData.phone_number.trim()) {
      const phoneRegex = /^(?:\+614|04)\d{8}$/;
      if (!phoneRegex.test(formData.phone_number.trim())) {
        newErrors.phone_number =
          'Please enter a valid Australian mobile number (e.g. 0400000000 or +61400000000)';
      }
    }

    if (!formData.street_address.trim())
      newErrors.street_address = 'Street address is required';
    if (!formData.suburb.trim()) newErrors.suburb = 'Suburb is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postcode.trim()) newErrors.postcode = 'Postcode is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        const { confirmPassword: _confirmPassword, ...registrationData } =
          formData;

        const userData = await api.auth.register(registrationData);
        login(userData);
        navigate('/');
      } catch (error) {
        console.error('Registration error:', error);
        setError(
          error.message ||
            'Registration failed. Please check your information and try again.'
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="container">
      <div className="register-page">
        <h1 className="page-title">Create an Account</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-grid">
            {/* Personal Info */}
            <div className="form-section">
              <h2 className="section-title">Personal Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">First Name *</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={errors.first_name ? 'input-error' : ''}
                  />
                  {errors.first_name && (
                    <span className="error">{errors.first_name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">Last Name *</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={errors.last_name ? 'input-error' : ''}
                  />
                  {errors.last_name && (
                    <span className="error">{errors.last_name}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'input-error' : ''}
                  />
                  {errors.email && (
                    <span className="error">{errors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone_number">Phone Number</label>
                  <input
                    type="text"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className={errors.phone_number ? 'input-error' : ''}
                  />
                  {errors.phone_number && (
                    <span className="error">{errors.phone_number}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'input-error' : ''}
                  />
                  {errors.password && (
                    <span className="error">{errors.password}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'input-error' : ''}
                  />
                  {errors.confirmPassword && (
                    <span className="error">{errors.confirmPassword}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Address Info */}
            <div className="form-section">
              <h2 className="section-title">Address Information</h2>

              <div className="form-group full-width">
                <label htmlFor="street_address">Street Address *</label>
                <input
                  type="text"
                  id="street_address"
                  name="street_address"
                  value={formData.street_address}
                  onChange={handleChange}
                  className={errors.street_address ? 'input-error' : ''}
                />
                {errors.street_address && (
                  <span className="error">{errors.street_address}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="suburb">Suburb *</label>
                  <input
                    type="text"
                    id="suburb"
                    name="suburb"
                    value={formData.suburb}
                    onChange={handleChange}
                    className={errors.suburb ? 'input-error' : ''}
                  />
                  {errors.suburb && (
                    <span className="error">{errors.suburb}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={errors.state ? 'input-error' : ''}
                  >
                    <option value="">Select</option>
                    <option value="NSW">New South Wales</option>
                    <option value="VIC">Victoria</option>
                    <option value="QLD">Queensland</option>
                    <option value="WA">Western Australia</option>
                    <option value="SA">South Australia</option>
                    <option value="TAS">Tasmania</option>
                    <option value="ACT">Australian Capital Territory</option>
                    <option value="NT">Northern Territory</option>
                  </select>
                  {errors.state && (
                    <span className="error">{errors.state}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="postcode">Postcode *</label>
                  <input
                    type="text"
                    id="postcode"
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleChange}
                    className={errors.postcode ? 'input-error' : ''}
                  />
                  {errors.postcode && (
                    <span className="error">{errors.postcode}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn register-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="login-link">
            Already have an account? <a href="/login">Login here</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
