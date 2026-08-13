import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <span className="navbar-brand">EduAI</span>
        <div className="navbar-user">
          <span>👋 {user?.fullName}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="dashboard-content">
        <div className="dashboard-welcome">
          <h2>Student Dashboard</h2>
          <p>Welcome back, {user?.fullName}. Your learning journey continues here.</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Enrolled Courses</h3>
            <div className="stat-number">{user?.enrolledCourses?.length || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <div className="stat-number">{user?.completedCourses?.length || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Quizzes Taken</h3>
            <div className="stat-number">0</div>
          </div>
          <div className="stat-card">
            <h3>Recommendations</h3>
            <div className="stat-number">0</div>
          </div>
        </div>
        <div className="card">
          <p className="section-title">🚀 More features coming soon</p>
          <p style={{color:'#888'}}>Course browsing, quizzes, and personalized recommendations will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
