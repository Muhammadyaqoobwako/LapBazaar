import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';


const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>LapBazaar</h1>
      <ul>
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/marketplace">Sell</Link></li>
        <li><Link to="/uploadedlaptoppage">Marketplace</Link></li>
        <li><Link to="/repair">Repair</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><link to ="/adminpage">AdminPage</link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
