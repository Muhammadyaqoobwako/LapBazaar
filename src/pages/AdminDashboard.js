import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Settings,
  Monitor,
  Tool,
  AlertCircle,
  BarChart2
} from "react-feather";
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('repairs');
  const [users, setUsers] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [laptops, setLaptops] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Verify admin status
        const authResponse = await axios.get('/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (authResponse.data.user.role !== 'admin') {
          navigate('/');
          return;
        }

        // Fetch all data in parallel
        const [usersRes, repairsRes, laptopsRes, statsRes] = await Promise.all([
          axios.get('/api/v1/users', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/v1/repairs', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/v1/laptops?limit=100', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/v1/stats', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setUsers(usersRes.data);
        setRepairs(repairsRes.data);
        setLaptops(laptopsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
        console.error('Admin dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Handle status updates
  const updateStatus = async (type, id, newStatus) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `/api/v1/${type}/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh data
      const response = await axios.get(`/api/v1/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (type === 'repairs') setRepairs(response.data);
      if (type === 'laptops') setLaptops(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle deletion
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`/api/v1/${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      if (type === 'users') setUsers(users.filter(user => user._id !== id));
      if (type === 'repairs') setRepairs(repairs.filter(repair => repair._id !== id));
      if (type === 'laptops') setLaptops(laptops.filter(laptop => laptop._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Deletion failed');
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search term
  const filteredData = {
    users: users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    repairs: repairs.filter(repair => 
      repair.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.status.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    laptops: laptops.filter(laptop => 
      laptop.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      laptop.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      laptop.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-search">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon users">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.userCount || 0}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon laptops">
            <Monitor size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.laptopCount || 0}</h3>
            <p>Laptop Listings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon repairs">
            <Tool size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.repairCount || 0}</h3>
            <p>Repair Requests</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <BarChart2 size={24} />
          </div>
          <div className="stat-info">
            <h3>₹{stats.totalRevenue?.toLocaleString() || 0}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <nav className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === "repairs" ? "active" : ""}`}
            onClick={() => setActiveTab("repairs")}
          >
            <Tool size={16} /> Repair Requests
          </button>
          <button
            className={`tab-btn ${activeTab === "laptops" ? "active" : ""}`}
            onClick={() => setActiveTab("laptops")}
          >
            <Laptop size={16} /> Laptop Listings
          </button>
          <button
            className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={16} /> Users
          </button>
          <button
            className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={16} /> Settings
          </button>
        </nav>

        <div className="admin-table-container">
          {activeTab === "repairs" && (
            <div className="repairs-table">
              <h2>Repair Requests</h2>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Device</th>
                    <th>Customer</th>
                    <th>Issue</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.repairs.map((repair) => (
                    <tr key={repair._id}>
                      <td>{repair._id.slice(-6)}</td>
                      <td>
                        {repair.brand} {repair.model}
                      </td>
                      <td>
                        {repair.name}
                        <br />
                        {repair.phone}
                      </td>
                      <td className="issue-cell">
                        {repair.issue.slice(0, 50)}...
                      </td>
                      <td>
                        <select
                          value={repair.status}
                          onChange={(e) =>
                            updateStatus("repairs", repair._id, e.target.value)
                          }
                          className={`status-select ${repair.status}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="diagnosing">Diagnosing</option>
                          <option value="in-progress">In Progress</option>
                          <option value="waiting-parts">Waiting Parts</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>{new Date(repair.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() =>
                            navigate(`/admin/repairs/${repair._id}`)
                          }
                        >
                          View
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete("repairs", repair._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "laptops" && (
            <div className="laptops-table">
              <h2>Laptop Listings</h2>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Brand/Model</th>
                    <th>Specs</th>
                    <th>Price</th>
                    <th>Seller</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.laptops.map((laptop) => (
                    <tr key={laptop._id}>
                      <td>{laptop._id.slice(-6)}</td>
                      <td>
                        {laptop.brand} {laptop.model}
                      </td>
                      <td>
                        {laptop.processor}, {laptop.ram}, {laptop.storage}
                      </td>
                      <td>₹{laptop.price.toLocaleString()}</td>
                      <td>{laptop.seller?.name || "Unknown"}</td>
                      <td>
                        <select
                          value={laptop.status}
                          onChange={(e) =>
                            updateStatus("laptops", laptop._id, e.target.value)
                          }
                          className={`status-select ${laptop.status}`}
                        >
                          <option value="available">Available</option>
                          <option value="pending">Pending</option>
                          <option value="sold">Sold</option>
                          <option value="removed">Removed</option>
                        </select>
                      </td>
                      <td>{new Date(laptop.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => navigate(`/marketplace/${laptop._id}`)}
                        >
                          View
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete("laptops", laptop._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "users" && (
            <div className="users-table">
              <h2>User Management</h2>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.users.map((user) => (
                    <tr key={user._id}>
                      <td>{user._id.slice(-6)}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <select
                          value={user.role}
                          onChange={(e) =>
                            updateStatus("users", user._id, e.target.value)
                          }
                          className={`role-select ${user.role}`}
                        >
                          <option value="user">User</option>
                          <option value="dealer">Dealer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete("users", user._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="admin-settings">
              <h2>System Settings</h2>
              <div className="settings-card">
                <h3>
                  <AlertCircle size={18} /> System Notifications
                </h3>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Email alerts for new repair requests
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Notify when laptop is sold
                  </label>
                </div>
              </div>

              <div className="settings-card">
                <h3>
                  <Settings size={18} /> Maintenance Mode
                </h3>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" />
                    Enable maintenance mode
                  </label>
                  <p className="hint">
                    When enabled, only admins can access the site
                  </p>
                </div>
              </div>

              <div className="settings-card">
                <h3>Backup & Restore</h3>
                <button className="backup-btn">Create Database Backup</button>
                <button className="restore-btn">Restore From Backup</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;