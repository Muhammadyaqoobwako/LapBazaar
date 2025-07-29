import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Repair.css'; // Make sure you have this CSS file

const Repair = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    deviceType: 'laptop', // Default value
    brand: '',
    model: '',
    issue: '',
    address: '',
    status: 'pending' // Default status for new requests
  });
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(true); // State to toggle between form and list
  const navigate = useNavigate();

  // Define your API base URL
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  const REPAIR_API = `${API_BASE_URL}/api/v1/repairs`;

  // Get token from localStorage
  const token = localStorage.getItem('authToken');

  // --- Fetch User's Repair Requests on Component Mount / Token Change ---
  useEffect(() => {
    const fetchRepairs = async () => {
      // If no token, we can't fetch user-specific repairs
      if (!token) {
        setRepairs([]); // Clear any old repairs if token is gone
        setError('Please log in to view your repair requests.');
        return;
      }

      try {
        setLoading(true);
        setError(''); // Clear previous errors
        const response = await axios.get(REPAIR_API, {
          headers: {
            Authorization: `Bearer ${token}` // Ensure "Bearer " prefix for JWT
          }
        });
        setRepairs(response.data.data); // Assuming your backend returns { success: true, data: [...] }
      } catch (err) {
        console.error('Failed to fetch repair requests:', err);
        setError(err.response?.data?.message || 'Failed to fetch repair requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if authenticated (token exists)
    if (token) {
      fetchRepairs();
    }
  }, [token, REPAIR_API]); // Re-run effect if token or API URL changes

  // --- Handle Form Input Changes ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- Handle Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Basic client-side validation
    if (!formData.name || !formData.phone || !formData.issue || !formData.address || !formData.brand) {
      setError('Please fill in all required fields (Name, Phone, Brand, Issue, Address).');
      return;
    }

    if (!token) {
      setError('You must be logged in to submit a repair request.');
      navigate('/login'); // Redirect to login if no token
      return;
    }

    try {
      setLoading(true);
      // Send POST request to create a new repair request
      const response = await axios.post(REPAIR_API, formData, {
        headers: {
          Authorization: `Bearer ${token}` // Ensure "Bearer " prefix
        }
      });

      // After successful submission, refetch the list of repairs to show the new one
      // (This is already handled by the useEffect for fetchRepairs, but can be explicit)
      // For immediate update without a re-fetch, you could add response.data.data to `repairs` state
      setRepairs(prevRepairs => [...prevRepairs, response.data.data]); // Assuming response.data.data is the new repair object

      // Reset form fields
      setFormData({
        name: '',
        phone: '',
        email: '',
        deviceType: 'laptop',
        brand: '',
        model: '',
        issue: '',
        address: '',
        status: 'pending'
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (err) {
      console.error('Error submitting repair request:', err);
      // Display specific error from backend if available, otherwise a generic one
      setError(err.response?.data?.message || 'Failed to submit repair request. Please check your input and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="repair-container">
      <h1 className="repair-title">Laptop Repair Service</h1>

      <div className="repair-toggle">
        <button className={`toggle-btn ${showForm ? 'active' : ''}`} onClick={() => setShowForm(true)}>Request Repair</button>
        <button className={`toggle-btn ${!showForm ? 'active' : ''}`} onClick={() => setShowForm(false)}>View My Repairs</button>
      </div>

      {showForm ? (
        // --- Repair Request Form ---
        <div className="repair-form-container">
          <h2>Book Repair Service</h2>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">Repair request submitted successfully!</div>}

          <form onSubmit={handleSubmit} className="repair-form">
            <div className="form-group">
              <label htmlFor="name">Your Name*</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number*</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required pattern="[0-9]{10,15}" title="Phone number must be 10-15 digits" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="deviceType">Device Type*</label>
              <select id="deviceType" name="deviceType" value={formData.deviceType} onChange={handleChange}>
                <option value="laptop">Laptop</option>
                <option value="desktop">Desktop</option>
                <option value="tablet">Tablet</option>
                <option value="other">Other</option> {/* Added an 'Other' option */}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="brand">Brand*</label>
              <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="model">Model</label>
              <input type="text" id="model" name="model" value={formData.model} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="issue">Issue Description*</label>
              <textarea id="issue" name="issue" value={formData.issue} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="address">Address for Service*</label>
              <textarea id="address" name="address" value={formData.address} onChange={handleChange} required />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Repair Request'}
            </button>
          </form>
        </div>
      ) : (
        // --- My Repair Requests List ---
        <div className="repair-list-container">
          <h2>My Repair Requests</h2>
          {loading ? (
            <div className="loading">Loading your repair requests...</div>
          ) : error && repairs.length === 0 ? (
            <div className="error-message">{error}</div>
          ) : repairs.length === 0 ? (
            <div className="no-repairs">You have not submitted any repair requests yet.</div>
          ) : (
            <div className="repair-list">
              {repairs.map(repair => (
                <div key={repair._id} className="repair-card">
                  <div className="repair-header">
                    <h3>{repair.brand} {repair.model} ({repair.deviceType})</h3>
                    <span className={`status ${repair.status}`}>{repair.status}</span>
                  </div>
                  <p className="issue">{repair.issue}</p>
                  <div className="repair-details">
                    <p><strong>Request ID:</strong> {repair._id}</p>
                    <p><strong>Submitted On:</strong> {new Date(repair.createdAt).toLocaleDateString()} at {new Date(repair.createdAt).toLocaleTimeString()}</p>
                    {repair.estimatedCost && <p><strong>Estimated Cost:</strong> Rs. {repair.estimatedCost}</p>}
                    {repair.completionDate && <p><strong>Completion Date:</strong> {new Date(repair.completionDate).toLocaleDateString()}</p>}
                    {repair.address && <p><strong>Service Address:</strong> {repair.address}</p>}
                    {repair.phone && <p><strong>Contact Phone:</strong> {repair.phone}</p>}
                  </div>
                  {/* You can add a button to view more details on a separate page if needed */}
                  {/* <button className="view-details" onClick={() => navigate(`/repairs/${repair._id}`)}>
                    View Details
                  </button> */}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Repair;