// src/components/Footer.js
import React from 'react';
import './Footer.css'; // Optional for styling

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} LapBazaar. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
