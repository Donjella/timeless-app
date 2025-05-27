import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { api } from '../utils/api';

const UserModal = ({ isOpen, onClose, user = null, onSave }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    role: 'user',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        role: user.role || 'user',
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        role: 'user',
        password: '',
      });
    }
    setError(null);
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError('First name, last name, and email are required');
      return;
    }

    if (!user && !formData.password) {
      setError('Password is required for new users');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dataToSubmit = { ...formData };
      if (user) {
        delete dataToSubmit.password;
      }

      if (user) {
        if (formData.role !== user.role) {
          try {
            await api.users.updateRole(user._id, formData.role);
          } catch (roleErr) {
            console.error('Error updating role:', roleErr);
          }
        }

        const profileData = {
          first_name: dataToSubmit.first_name,
          last_name: dataToSubmit.last_name,
          phone_number: dataToSubmit.phone_number,
        };

        if (api.auth.isAdmin()) {
          await api.users.updateByEmail(user.email, {
            ...profileData,
            role: formData.role,
          });
        } else {
          await api.users.updateProfile(profileData);
        }
      } else {
        await api.auth.register(dataToSubmit);
      }

      const updatedUserData = user
        ? {
            ...user,
            first_name: dataToSubmit.first_name,
            last_name: dataToSubmit.last_name,
            phone_number: dataToSubmit.phone_number,
            role: dataToSubmit.role,
          }
        : dataToSubmit;

      onSave(updatedUserData, user ? 'edit' : 'add');
      onClose();
    } catch (err) {
      console.error('Form submission error:', err);

      let errorMessage = 'An error occurred while saving the user';

      if (err.message) {
        errorMessage = err.message;
      } else if (err.status === 0) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (err.status === 400) {
        errorMessage = 'Invalid data provided. Please check your inputs.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container user-modal">
        <div className="modal-header">
          <h2>{user ? 'Edit User' : 'Add New User'}</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-text">{error}</div>}

          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="First Name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Last Name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              disabled={!!user}
              className={user ? 'disabled' : ''}
            />
          </div>

          {!user && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password || ''}
                onChange={handleChange}
                placeholder="Password (minimum 6 characters)"
                required={!user}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="phone_number">Phone Number</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Phone Number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">User Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : user ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

UserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string,
    phone_number: PropTypes.string,
    role: PropTypes.string,
  }),
};

export default UserModal;
