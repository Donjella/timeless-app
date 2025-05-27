// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthData } from '../hooks/useAuthData';
import { api } from '../utils/api';
import '../styles/login.css';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuthData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        // Use our API utility to login
        const userData = await api.auth.login(formData);

        // Login the user with our auth context
        login(userData);

        // Redirect to home page after successful login
        navigate('/');
      } catch (error) {
        console.error('Login error:', error);
        setError(
          error.message || 'Login failed. Please check your credentials.'
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="container">
      <div className="login-page">
        <h1 className="page-title">Login to Your Account</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn login-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging In...' : 'Login'}
            </button>
          </div>

          <div className="register-link">
            Don&apos;t have an account? <a href="/register">Register here</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
