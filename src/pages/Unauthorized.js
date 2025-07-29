// src/pages/Unauthorized.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Unauthorized.css'; // Create this CSS file for styling

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <h1>Access Denied</h1>
      <h2>You are not authorized to view this page.</h2>
      <p>Please log in with an appropriate account or return to the main site.</p>
      <Link to="/" className="home-link">Go to Homepage</Link>
      <Link to="/login" className="login-link">Login</Link>
    </div>
  );
};

export default Unauthorized;