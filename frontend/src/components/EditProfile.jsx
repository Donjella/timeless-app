import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';
import { useAuthData } from '../hooks/useAuthData';
import '../styles/edit-profile.css';

const EditProfile = () => {
  const navigate = useNavigate();
  const { authData } = useAuthData();
  const [formData, setFormData] = useState({
    // Personal Info
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',

    // Address Info
    street_address: '',
    suburb: '',
    state: '',
    postcode: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Australian states for dropdown
  const australianStates = [
    'NSW',
    'VIC',
    'QLD',
    'WA',
    'SA',
    'TAS',
    'ACT',
    'NT',
  ];

  // Fetch existing profile data on component mount
  useEffect(() => {
    // Check if user is authenticated
    if (!authData.isAuthenticated) {
      navigate('/login?redirect=/account/edit-profile');
      return;
    }

    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const profileData = await api.auth.getProfile();

        // Populate form with existing data
        setFormData({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          email: profileData.email || '',
          phone_number: profileData.phone_number || '',

          // Address fields (use optional chaining)
          street_address: profileData.address?.street_address || '',
          suburb: profileData.address?.suburb || '',
          state: profileData.address?.state || '',
          postcode: profileData.address?.postcode || '',
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(api.utils.formatErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [authData, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Combine personal and address data into a single update
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        street_address: formData.street_address,
        suburb: formData.suburb,
        state: formData.state,
        postcode: formData.postcode,
      };

      // Use a single update method
      await api.auth.updateProfile(updateData);

      setSuccessMessage('Profile updated successfully!');

      // Redirect back to profile page after a short delay
      setTimeout(() => {
        navigate('/account/profile');
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(api.utils.formatErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-container">
        <h1>Edit Profile</h1>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="close-error">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-profile-form">
          {/* Personal Information Section */}
          <div className="form-section">
            <h2>Personal Information</h2>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="email">Email (Cannot be changed)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                />
              </div>
              <div className="form-field">
                <label htmlFor="phone_number">Phone Number</label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div className="form-section">
            <h2>Address Information</h2>
            <div className="form-grid">
              <div className="form-field full-width">
                <label htmlFor="street_address">Street Address</label>
                <input
                  type="text"
                  id="street_address"
                  name="street_address"
                  value={formData.street_address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="suburb">Suburb</label>
                <input
                  type="text"
                  id="suburb"
                  name="suburb"
                  value={formData.suburb}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="state">State</label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select State</option>
                  {australianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="postcode">Postcode</label>
                <input
                  type="text"
                  id="postcode"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleChange}
                  pattern="\d{4}"
                  title="Please enter a 4-digit Australian postcode"
                  required
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/account/profile')}
            >
              <X size={18} /> Cancel
            </button>
            <button type="submit" className="save-btn" disabled={isLoading}>
              <Save size={18} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
