import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Admin.css';

const AdminPage = () => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  const REPAIR_API = `${API_BASE_URL}/api/v1/repairs`;

  useEffect(() => {
    fetchAllRepairs();
  }, []);

  const fetchAllRepairs = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(REPAIR_API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRepairs(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching repairs');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(`${REPAIR_API}/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh the repair list
      fetchAllRepairs();
    } catch (err) {
      alert('Failed to update status');
      console.error(err);
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Repair Requests (Technician View)</h1>

      {loading ? (
        <p>Loading repair requests...</p>
      ) : error ? (
        <p className="admin-error">{error}</p>
      ) : repairs.length === 0 ? (
        <p>No repair requests found.</p>
      ) : (
        <div className="admin-repair-list">
          {repairs.map(repair => (
            <div key={repair._id} className="admin-repair-card">
              <div className="admin-repair-header">
                <h3>{repair.brand} {repair.model} ({repair.deviceType})</h3>
                <span className={`status ${repair.status}`}>{repair.status}</span>
              </div>
              <p><strong>Issue:</strong> {repair.issue}</p>
              <p><strong>Requested By:</strong> {repair.name}</p>
              <p><strong>Contact:</strong> {repair.phone} | {repair.email}</p>
              <p><strong>Address:</strong> {repair.address}</p>
              <p><strong>Submitted:</strong> {new Date(repair.createdAt).toLocaleString()}</p>
              {repair.estimatedCost && <p><strong>Estimated Cost:</strong> Rs. {repair.estimatedCost}</p>}
              {repair.completionDate && <p><strong>Completion Date:</strong> {new Date(repair.completionDate).toLocaleDateString()}</p>}

              {/* Approve Button */}
              {repair.status === 'pending' && (
                <button
                  className="approve-btn"
                  onClick={() => updateStatus(repair._id, 'approved')}
                >
                  Approve Request
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
