import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';

const HomePage = () => {
  return (
    <div className="home-content">
      <h1>Welcome to Timeless</h1>
      <p className="tagline">Premium luxury watches for any occasion</p>
      <div className="home-cta">
        <Link to="/catalog" className="btn">
          Browse Our Collection
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
