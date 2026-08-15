import { useAuth } from '../context/AuthContext';
import { useNavigate, NavLink } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const studentLinks = [
    { to: '/student/dashboard', label: '🏠 Dashboard' },
    { to: '/student/courses',   label: '📚 Courses' },
    { to: '/student/results',   label: '📊 Results' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: '🏠 Dashboard' },
    { to: '/admin/courses',   label: '📚 Courses' },
    { to: '/admin/quizzes',   label: '📝 Quizzes' },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <span className="navbar-brand">
          EduAI {user?.role === 'admin' ? '— Admin' : ''}
        </span>
        <div style={{ display:'flex', gap:'1.5rem', alignItems:'center' }}>
          {links.map(link => (
            <NavLink key={link.to} to={link.to}
              style={({ isActive }) => ({
                fontSize:'0.9rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#667eea' : '#555',
              })}>
              {link.label}
            </NavLink>
          ))}
        </div>
        <div className="navbar-user">
          <span style={{ fontSize:'0.85rem' }}>{user?.fullName}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="dashboard-content">{children}</div>
    </div>
  );
};

export default DashboardLayout;
