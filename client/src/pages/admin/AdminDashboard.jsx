import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <span className="navbar-brand">EduAI — Admin</span>
        <div className="navbar-user">
          <span>{user?.fullName}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="dashboard-content">
        <div className="dashboard-welcome">
          <h2>Admin Dashboard</h2>
          <p>Manage your platform, courses, and students from here.</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Students</h3>
            <div className="stat-number">0</div>
          </div>
          <div className="stat-card">
            <h3>Total Courses</h3>
            <div className="stat-number">0</div>
          </div>
          <div className="stat-card">
            <h3>Total Quizzes</h3>
            <div className="stat-number">0</div>
          </div>
          <div className="stat-card">
            <h3>Active Users</h3>
            <div className="stat-number">0</div>
          </div>
        </div>
        <div className="card">
          <p className="section-title">⚙️ Admin tools coming soon</p>
          <p style={{color:'#888'}}>Course management, quiz creation, and student performance reports will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
