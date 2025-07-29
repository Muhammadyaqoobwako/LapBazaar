import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleSelectionPage.css';

function RoleSelectionPage() {
  const navigate = useNavigate();

  const handleRoleClick = (role) => {
    // ✅ Save the selected role to localStorage
    localStorage.setItem('role', role);

    // Optionally, you can also update user role in backend here using fetch or axios

    // ✅ Redirect to home or dashboard
    navigate('/home');
  };

  return (
    <div className="role-page">
      <h1 className="title">LapBazaar</h1>
      <p className="subtitle">Select your role to continue</p>
      <div className="role-grid">
        <div className="role-card user" onClick={() => handleRoleClick('user')}>
          <i className="fas fa-user fa-3x"></i>
          <p>User</p>
        </div>
        <div className="role-card admin" onClick={() => handleRoleClick('admin')}>
          <i className="fas fa-user-shield fa-3x"></i>
          <p>Admin</p>
        </div>
        <div className="role-card technician" onClick={() => handleRoleClick('technician')}>
          <i className="fas fa-tools fa-3x"></i>
          <p>Technician</p>
        </div>
      </div>
    </div>
  );
}

export default RoleSelectionPage;
