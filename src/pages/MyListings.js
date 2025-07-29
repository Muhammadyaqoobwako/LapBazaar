// src/pages/MyListings.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // Import useUser hook
import './MyListings.css'; // You'll need to create this CSS file for styling

const MyListings = () => {
  const { user, authToken, logout } = useUser(); // Get user info, token, and logout function
  const navigate = useNavigate();
  const [laptops, setLaptops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // If user is not logged in according to context, redirect
    if (!user) {
      setError('You need to be logged in to view your listings.');
      setLoading(false);
      setTimeout(() => navigate('/login'), 1500); // Redirect after a short delay
      return;
    }

    const fetchMyLaptops = async () => {
      try {
        // Make an authenticated request to get user's specific listings
        const response = await axios.get('http://localhost:5000/api/v1/laptops/my-laptops', {
          headers: {
            Authorization: `Bearer ${authToken}` // Include the auth token
          }
        });
        setLaptops(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching my listings:', err);
        // Handle specific error codes like 401 (Unauthorized) or 403 (Forbidden)
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Session expired or unauthorized. Please log in again.');
          logout(); // Clear invalid token from context and local storage
          setTimeout(() => navigate('/login'), 1500);
        } else {
          setError('Failed to fetch your listings. Please try again.');
        }
        setLoading(false);
      }
    };

    fetchMyLaptops();
  }, [user, authToken, navigate, logout]); // Re-run effect if user or token changes

  const handleDelete = async (laptopId) => {
    // Confirmation dialog before deletion
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      // Send authenticated DELETE request
      await axios.delete(`http://localhost:5000/api/v1/laptops/${laptopId}`, {
        headers: {
          Authorization: `Bearer ${authToken}` // Include the auth token
        }
      });
      // Update state to remove the deleted laptop from the list immediately
      setLaptops(prevLaptops => prevLaptops.filter(laptop => laptop._id !== laptopId));
      alert('Listing deleted successfully!'); // Provide feedback
    } catch (err) {
      console.error('Error deleting listing:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Unauthorized to delete this listing or session expired. Please log in again.');
        logout();
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(err.response?.data?.error || 'Failed to delete listing. Please try again.');
      }
    }
  };

  // --- Render logic based on loading and error states ---
  if (loading) {
    return <div className="my-listings-container">Loading your listings...</div>;
  }

  if (error) {
    return <div className="my-listings-container error-message">{error}</div>;
  }

  // If user is null after loading (should be caught by initial check, but as a fallback)
  if (!user) {
    return <div className="my-listings-container">Please log in to view your listings.</div>;
  }

  return (
    <div className="my-listings-container">
      <h2>My Listed Laptops</h2>
      {laptops.length === 0 ? (
        <p>You have not listed any laptops yet. <Link to="/sell">Sell a laptop now!</Link></p>
      ) : (
        <div className="listings-grid">
          {laptops.map(laptop => (
            <div key={laptop._id} className="listing-card">
              {/* Display first image or a placeholder */}
              <img
                src={laptop.images && laptop.images.length > 0 ? `http://localhost:5000${laptop.images[0]}` : 'placeholder.jpg'}
                alt={`${laptop.brand} ${laptop.model}`}
                className="listing-image"
              />
              <h3>{laptop.brand} {laptop.model}</h3>
              <p>Price: ₹{laptop.price}</p>
              <div className="listing-actions">
                {/* Link to the detailed view of the laptop */}
                <Link to={`/laptop/${laptop._id}`} className="button view-details-btn">View Details</Link>
                {/* Button to delete the listing */}
                <button onClick={() => handleDelete(laptop._id)} className="button delete-btn">Delete</button>
                {/* Optional: Add an Edit button, link to an /edit-laptop/:id page */}
                {/* <Link to={`/edit-laptop/${laptop._id}`} className="button edit-btn">Edit</Link> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;