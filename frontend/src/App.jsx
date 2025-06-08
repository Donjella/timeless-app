import React, { useEffect } from 'react'; 
import PropTypes from 'prop-types';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './styles/app.css';
import { BasePageLayout } from './pages/layouts/BasePageLayout';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import AdminDashboard from './components/AdminDashboard';
import WatchCatalog from './components/WatchCatalog';
import Checkout from './components/Checkout';
import SimplifiedCheckout from './components/SimplifiedCheckout';
import UserProfile from './components/UserProfile';
import EditProfile from './components/EditProfile';
import About from './pages/About';
import HomePage from './pages/Home';
import { useAuthData } from './hooks/useAuthData';
import { AuthProvider } from '/src/contexts/AuthProvider.jsx';

// Create an inner component that uses the auth context
function AppRoutes() {
  const { authData } = useAuthData();

  // Check if user is an admin
  const isAdmin =
    authData.isAuthenticated && authData.user && authData.user.role === 'admin';

  // Protected route component for admin-only routes
  const AdminRoute = ({ children }) => {
    if (!authData.isAuthenticated) {
      return <Navigate to="/login" />;
    }

    if (!isAdmin) {
      return <Navigate to="/" />;
    }

    return children;
  };

  AdminRoute.propTypes = {
    children: PropTypes.node.isRequired,
  };

  // Regular user protected route - requires authentication
  const ProtectedRoute = ({ children }) => {
    if (!authData.isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
  };

  // Public-only route - redirects to home if user is already logged in
  const PublicOnlyRoute = ({ children }) => {
    if (authData.isAuthenticated) {
      return <Navigate to="/" />;
    }

    return children;
  };

  PublicOnlyRoute.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<BasePageLayout />}>
          {/* Public routes */}
          <Route index element={<HomePage />} />
          {/* Add route for /index.html to handle GCS direct access */}
          <Route path="index.html" element={<HomePage />} />
          <Route path="catalog" element={<WatchCatalog />} />
          <Route path="about" element={<About />} />

          {/* Auth routes - redirect to home if already logged in */}
          <Route
            path="login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />

          {/* User routes (protected) */}
          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="payment"
            element={
              <ProtectedRoute>
                <SimplifiedCheckout />
              </ProtectedRoute>
            }
          />
          <Route
            path="account/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="account/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Not found */}
          <Route
            path="*"
            element={<div className="not-found">404 - Page Not Found</div>}
          />
        </Route>
      </Routes>
    </Router>
  );
}

// Main App component that provides the AuthContext
function App() {
  const location = window.location.pathname;

  if (location === '/index.html') {
    window.history.replaceState({}, '', '/');
    // Prevent app from rendering for a tick
    return null;
  }

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;