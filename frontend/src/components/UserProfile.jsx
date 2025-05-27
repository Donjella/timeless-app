import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Clock,
  Package,
  Edit,
  AlertCircle,
  X,
} from 'lucide-react';
import { api } from '../utils/api';
import { useAuthData } from '../hooks/useAuthData';
import UserRentals from './UserRentals';
import '../styles/user-profile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const { authData } = useAuthData();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // Check if user is logged in
    if (!authData.isAuthenticated) {
      navigate('/login?redirect=/account/profile');
      return;
    }

    // Fetch user's profile data
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Check if authentication is valid
        if (!api.auth.isAuthenticated()) {
          // Token expired or missing, redirect to login
          navigate('/login?redirect=/account/profile&message=expired');
          return;
        }

        const profile = await api.auth.getProfile();
        setProfileData(profile);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        if (err.status === 401) {
          // Unauthorized - token likely expired
          localStorage.removeItem('auth');
          navigate('/login?redirect=/account/profile&message=expired');
          return;
        }
        setError('Failed to load your profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [authData, navigate]);

  if (isLoading) {
    return <div className="loading-container">Loading your profile...</div>;
  }

  return (
    <div className="user-profile-page">
      <div className="profile-container">
        <h1>My Account</h1>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="close-error">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`tab-button ${activeTab === 'rentals' ? 'active' : ''}`}
            onClick={() => setActiveTab('rentals')}
          >
            Rentals
          </button>
        </div>

        {activeTab === 'profile' && profileData && (
          <div className="profile-content">
            <div className="profile-section personal-info">
              <div className="section-header">
                <div className="section-title">
                  <User className="icon" />
                  <h2>Personal Information</h2>
                </div>
                <button
                  className="edit-button"
                  onClick={() => navigate('/account/edit-profile')}
                >
                  <Edit size={18} className="icon" /> Edit
                </button>
              </div>
              <div className="profile-grid">
                <div className="profile-field">
                  <span id="first-name-label">First Name</span>
                  <div
                    className="field-value"
                    aria-labelledby="first-name-label"
                  >
                    {profileData.first_name}
                  </div>
                </div>
                <div className="profile-field">
                  <span id="last-name-label">Last Name</span>
                  <div
                    className="field-value"
                    aria-labelledby="last-name-label"
                  >
                    {profileData.last_name}
                  </div>
                </div>
                <div className="profile-field">
                  <span id="email-label">Email</span>
                  <div className="field-value" aria-labelledby="email-label">
                    {profileData.email}
                  </div>
                </div>
                <div className="profile-field">
                  <span id="phone-label">Phone</span>
                  <div className="field-value" aria-labelledby="phone-label">
                    {profileData.phone_number}
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-section address-info">
              <div className="section-header">
                <div className="section-title">
                  <MapPin className="icon" />
                  <h2>Address</h2>
                </div>
                <button
                  className="edit-button"
                  onClick={() => navigate('/account/edit-profile')}
                >
                  <Edit size={18} className="icon" /> Edit
                </button>
              </div>
              <div className="address-fields">
                <div className="profile-field">
                  <span id="street-address-label">Street Address</span>
                  <div
                    className="field-value"
                    aria-labelledby="street-address-label"
                  >
                    {profileData.address?.street_address || 'Not provided'}
                  </div>
                </div>
                <div className="profile-field">
                  <span id="suburb-label">Suburb</span>
                  <div className="field-value" aria-labelledby="suburb-label">
                    {profileData.address?.suburb || 'Not provided'}
                  </div>
                </div>
                <div className="address-grid">
                  <div className="profile-field">
                    <span id="state-label">State</span>
                    <div className="field-value" aria-labelledby="state-label">
                      {profileData.address?.state || 'Not provided'}
                    </div>
                  </div>
                  <div className="profile-field">
                    <span id="postcode-label">Postcode</span>
                    <div
                      className="field-value"
                      aria-labelledby="postcode-label"
                    >
                      {profileData.address?.postcode || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-section rental-summary">
              <div className="section-header">
                <div className="section-title">
                  <Clock className="icon" />
                  <h2>Rental Overview</h2>
                </div>
                <button
                  className="view-all-button"
                  onClick={() => setActiveTab('rentals')}
                >
                  View All
                </button>
              </div>
              <div className="rental-summary-content">
                {/* This will be a simplified version of the rentals list */}
                <p>
                  Click &quot;View All&quot; to see your complete rental history
                  and manage your rentals.
                </p>
                <button
                  className="browse-watches-button"
                  onClick={() => navigate('/catalog')}
                >
                  Browse Watches
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rentals' && (
          <div className="rentals-tab-content">
            <UserRentals />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
