import { useAuth } from '../context/AuthContext';
import { useNavigate, NavLink } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  const studentLinks = [
    { to: '/student/dashboard',       label: '🏠 Dashboard'       },
    { to: '/student/courses',         label: '📚 Courses'         },
    { to: '/student/results',         label: '📊 Results'         },
    { to: '/student/recommendations', label: '💡 Recommendations' },
    { to: '/student/profile',         label: '👤 Profile'         },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: '🏠 Dashboard' },
    { to: '/admin/courses',   label: '📚 Courses'   },
    { to: '/admin/quizzes',   label: '📝 Quizzes'   },
    { to: '/admin/students',  label: '👥 Students'  },
    { to: '/admin/reports',   label: '📊 Reports'   },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <span className="navbar-brand" style={{ cursor:'pointer' }} onClick={() => navigate('/')}>
          EduAI {user?.role === 'admin' ? '— Admin' : ''}
        </span>
        <div style={{ display:'flex', gap:'1.25rem', alignItems:'center', flexWrap:'wrap' }}>
          {links.map(link => (
            <NavLink key={link.to} to={link.to}
              style={({ isActive }) => ({
                fontSize:'0.875rem', fontWeight: isActive ? 600 : 400,
                color: isActive ? '#667eea' : '#555', whiteSpace:'nowrap',
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
