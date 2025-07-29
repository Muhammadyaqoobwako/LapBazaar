// src/pages/LaptopDetail.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // Import useUser hook
import './LaptopDetail.css'; // You'll need to create this CSS file

const LaptopDetail = () => {
  const { id } = useParams(); // Get laptop ID from the URL parameter
  const navigate = useNavigate();
  const { user, authToken, logout } = useUser(); // Get user info, token, and logout function

  const [laptop, setLaptop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // For image carousel/gallery

  // Effect to fetch laptop details when component mounts or ID changes
  useEffect(() => {
    const fetchLaptop = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/v1/laptops/${id}`);
        setLaptop(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching laptop details:', err);
        setError(err.response?.data?.error || 'Failed to load laptop details. Laptop might not exist.');
        setLoading(false);
      }
    };
    fetchLaptop();
  }, [id]); // Dependency array: re-run if laptop ID changes

  const handleDelete = async () => {
    // Confirmation dialog before deletion
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      // Send authenticated DELETE request to the backend
      await axios.delete(`http://localhost:5000/api/v1/laptops/${laptop._id}`, {
        headers: {
          Authorization: `Bearer ${authToken}` // Include auth token
        }
      });
      alert('Listing deleted successfully!');
      navigate('/marketplace'); // Redirect to marketplace after successful deletion
    } catch (err) {
      console.error('Error deleting listing:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Unauthorized to delete this listing or session expired. Please log in again.');
        logout(); // Clear invalid token
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(err.response?.data?.error || 'Failed to delete listing. Please try again.');
      }
    }
  };

  // Determine if the logged-in user is the owner of the listing or an admin
  const isOwner = user && laptop && laptop.user && user.id === laptop.user._id;
  const isAdmin = user && user.role === 'admin';
  const isDealer = user && user.role === 'dealer'; // Assuming 'dealer' has permissions similar to 'user' or more specific ones

  // Permissions for actions
  const canDelete = isOwner || isAdmin;
  const canEdit = isOwner || isAdmin; // Assuming 'dealer' cannot edit/delete other listings, only their own

  // --- Render logic based on loading and error states ---
  if (loading) return <div className="laptop-detail-container">Loading laptop details...</div>;
  if (error) return <div className="laptop-detail-container error-message">{error}</div>;
  if (!laptop) return <div className="laptop-detail-container">Laptop not found.</div>; // Should be covered by error but good fallback

  return (
    <div className="laptop-detail-container">
      <div className="detail-header">
        <h1>{laptop.brand} {laptop.model}</h1>
        <p className="price">Price: ₹{laptop.price}</p>
      </div>

      <div className="detail-content">
        <div className="image-gallery">
          {laptop.images && laptop.images.length > 0 ? (
            <>
              {/* Main image display */}
              <img
                src={`http://localhost:5000${laptop.images[currentImageIndex]}`} // Ensure your backend serves static files from 'uploads'
                alt={`${laptop.brand} ${laptop.model}`}
                className="main-image"
              />
              {/* Thumbnail navigation for multiple images */}
              {laptop.images.length > 1 && (
                <div className="thumbnail-navigation">
                  {laptop.images.map((image, index) => (
                    <img
                      key={index}
                      src={`http://localhost:5000${image}`}
                      alt={`Thumbnail ${index}`}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="no-image-placeholder">No Image Available</div>
          )}
        </div>

        <div className="laptop-specs">
          <h3>Specifications</h3>
          <ul>
            <li><strong>Condition:</strong> {laptop.condition}</li>
            <li><strong>Processor:</strong> {laptop.processor}</li>
            <li><strong>RAM:</strong> {laptop.ram}</li>
            <li><strong>Storage:</strong> {laptop.storage}</li>
            {laptop.screenSize && <li><strong>Screen Size:</strong> {laptop.screenSize}</li>}
            {laptop.graphics && <li><strong>Graphics:</strong> {laptop.graphics}</li>}
            {laptop.warranty && <li><strong>Warranty:</strong> {laptop.warranty}</li>}
          </ul>

          {laptop.description && (
            <>
              <h3>Description</h3>
              <p>{laptop.description}</p>
            </>
          )}

          <div className="seller-info">
            <h3>Listed by:</h3>
            <p><strong>Username:</strong> {laptop.user?.name || 'N/A'}</p> {/* Use laptop.user?.name from Users.js */}
            <p><strong>Email:</strong> {laptop.user?.email || 'N/A'}</p>
            <p><strong>Role:</strong> {laptop.user?.role || 'N/A'}</p>
          </div>

          <div className="action-buttons">
            {/* Conditional rendering for Edit button */}
            {canEdit && (
              <Link to={`/edit-laptop/${laptop._id}`} className="button edit-btn">Edit Listing</Link>
            )}
            {/* Conditional rendering for Delete button */}
            {canDelete && (
              <button onClick={handleDelete} className="button delete-btn">Delete Listing</button>
            )}
            {/* Message for roles that can only view, e.g., if 'technician' was a role */}
            {user && user.role === 'technician' && !canEdit && ( // Assuming 'technician' role exists and cannot edit/delete
              <p className="info-message">As a technician, you can view details but not edit or delete.</p>
            )}
            {/* Add contact seller button here (will require a separate messaging feature) */}
            <button className="button contact-seller-btn">Contact Seller</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaptopDetail;