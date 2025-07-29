// client/src/pages/AdminRepairDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
// import repairService from '../services/repairService'; // You'll need to create this

const AdminRepairDashboard = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [repairs, setRepairs] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      const allowedRoles = ['admin', 'technician'];
      if (!allowedRoles.includes(user.role)) {
        console.warn(`Access Denied: User with role '${user.role}' attempted to access Admin Repair Dashboard.`);
        navigate('/unauthorized', { replace: true });
        return;
      }

      const fetchRepairs = async () => {
        try {
          // const response = await repairService.getAllRepairRequests(user.token);
          // setRepairs(response.data);

          // --- Mock data for demonstration ---
          const mockRepairs = [ /* ... */ ];
          setRepairs(mockRepairs);
          // --- End Mock data ---

        } catch (err) {
          console.error('Failed to fetch repair requests:', err);
          setError(t('failedToLoadRepairs', 'Failed to load repair requests.'));
        } finally {
          setDataLoading(false);
        }
      };

      fetchRepairs();
    }
  }, [user, loading, navigate, t]);

  if (loading || dataLoading) {
    return <div className="loading-indicator">{t('loading', 'Loading...')}: {t('repairRequests', 'Repair Requests')}</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-repair-dashboard">
      <h1>{t('allRepairRequests', 'All Repair Requests')}</h1>
      {repairs.length === 0 ? (
        <p>{t('noRepairRequestsFound', 'No repair requests found.')}</p>
      ) : (
        <table className="repair-table">
          <thead>
            <tr>
              <th>{t('requestID', 'ID')}</th>
              <th>{t('user', 'User')}</th>
              <th>{t('issue', 'Issue')}</th>
              <th>{t('status', 'Status')}</th>
              <th>{t('requestedOn', 'Requested On')}</th>
              <th>{t('actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {repairs.map((repair) => (
              <tr key={repair._id}>
                <td>{repair._id.substring(0, 6)}...</td>
                <td>{repair.user.username} ({repair.user.email})</td>
                <td>{repair.issue}</td>
                <td>{t(`status${repair.status}`, repair.status)}</td>
                <td>{new Date(repair.createdAt).toLocaleDateString()}</td>
                <td>
                  <Link to={`/repairs/${repair._id}`} className="button-small">
                    {t('viewDetails', 'View Details')}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminRepairDashboard;