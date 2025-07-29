import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';

import Signup from './pages/Signup';
import Login from './pages/Login';
import Sell from './pages/Sell';
import Home from './pages/Home';
import AdminPage from './pages/AdminPage';
import Marketplace from './pages/Marketplace';
import UploadedLaptopPage from './pages/UploadedLaptopPage';
import Repair from './pages/Repair';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import RoleSelectionPage from './pages/RoleSelectionPage';

import {
  User,
  LogOut,
  Home as HomeIcon,
  ShoppingBag,
  Tool,
  Mail,
  Settings,
} from 'react-feather';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [user, setUser] = useState(null);

  const location = useLocation();

  // Routes where Navbar and Footer should be hidden
  const hiddenLayoutRoutes = ['/login', '/signup', '/roles'];
  const isHiddenLayout = hiddenLayoutRoutes.includes(location.pathname);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = {
      id: localStorage.getItem('userId'),
      username: localStorage.getItem('username'),
      email: localStorage.getItem('email'),
      role: localStorage.getItem('role') || 'user'
    };

    if (token && storedUser.id) {
      setIsAuthenticated(true);
      setUser(storedUser);
      setUserRole(storedUser.role || 'user');
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setUserRole('user');
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    setUserRole('user');
  };

  const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    if (requiredRole === 'admin' && userRole !== 'admin') {
      return <Navigate to="/home" replace />;
    }
    return children;
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      {!isHiddenLayout && (
        <nav className="navbar">
          <div className="nav-content">
            <h1>LapBazaar</h1>
            <div className="nav-links">
              {isAuthenticated ? (
                <>
                  <Link to="/home" className="nav-link">
                    <HomeIcon size={18} className="nav-icon" /> Home
                  </Link>
                  <Link to="/uploadedlaptoppage" className="nav-link">
                    <ShoppingBag size={18} className="nav-icon" /> Marketplace
                  </Link>
                  <Link to="/marketplace" className="nav-link">
                    <User size={18} className="nav-icon" /> Sell
                  </Link>
                  <Link to="/repair" className="nav-link">
                    <Tool size={18} className="nav-icon" /> Repair
                  </Link>
                  <Link to="/contact" className="nav-link">
                    <Mail size={18} className="nav-icon" /> Contact
                  </Link>
                  <Link to="/adminpage" className="nav-link">
                    <Tool size={18} className="nav-icon" /> AdminPage
                  </Link>
                  {userRole === 'admin' && (
                    <Link to="/admin" className="nav-link">
                      <Settings size={18} className="nav-icon" /> Admin
                    </Link>
                  )}
                  <div className="nav-user">
                    <span>Welcome, {user?.username}</span>
                    <button onClick={handleLogout} className="nav-link logout-btn">
                      <LogOut size={18} className="nav-icon" /> Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link">Login</Link>
                  <Link to="/signup" className="nav-link">Signup</Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Routes */}
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/roles" replace />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/roles" element={<RoleSelectionPage />} />

          {/* Protected Routes */}
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/uploadedlaptoppage" element={
            <ProtectedRoute>
              <UploadedLaptopPage />
            </ProtectedRoute>
          } />
          <Route path="/marketplace" element={
            <ProtectedRoute>
              <Marketplace />
            </ProtectedRoute>
          } />
          <Route path="/repair" element={
            <ProtectedRoute>
              <Repair />
            </ProtectedRoute>
          } />
          <Route path="/adminpage" element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
        </Routes>
      </main>

      {/* Footer */}
      {!isHiddenLayout && (
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>LapBazaar</h3>
              <p>Your trusted marketplace for buying, selling, and repairing laptops.</p>
            </div>
            <div className="footer-section">
              <h3>Quick Links</h3>
              <Link to="/marketplace">Marketplace</Link>
              <Link to="/sell">Sell Your Laptop</Link>
              <Link to="/repair">Repair Services</Link>
            </div>
            <div className="footer-section">
              <h3>Contact</h3>
              <p>Email: support@lapbazaar.pk</p>
              <p>Phone: +92 300 1234567</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} LapBazaar. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
