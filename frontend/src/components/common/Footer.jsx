import { Link } from 'react-router-dom';
import '../../styles/footer.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Logo and description */}
          <div className="footer-section">
            <h3 className="footer-logo">TIMELESS</h3>
            <p className="footer-description">
              Your premium destination for luxury watch rentals.
            </p>
          </div>

          {/* Quick links */}
          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Home Page</Link>
              </li>
              <li>
                <Link to="/catalog">Our Collection</Link>
              </li>
              <li>
                <Link to="/about">About Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact information */}
          <div className="footer-section">
            <h3 className="footer-heading">Contact Us</h3>
            <address className="footer-address">
              <p>123 Watch Avenue</p>
              <p>Melbourne, VIC 3000</p>
              <p>Australia</p>
              <p>
                <a href="tel:+61398765432">+61 3 9876 5432</a>
              </p>
              <p>
                <a href="mailto:info@timeless.example.com">
                  info@timeless.example.com
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-copyright">
          <p>© {currentYear} Timeless Watch Rentals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
