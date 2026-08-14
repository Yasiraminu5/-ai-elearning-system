import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllCourses } from '../../api/courses';
import DashboardLayout from '../../layouts/DashboardLayout';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ courses:0, published:0 });

  useEffect(() => {
    getAllCourses().then(({ data }) => {
      const courses = data.courses || [];
      setStats({
        courses: courses.length,
        published: courses.filter(c => c.isPublished).length,
      });
    }).catch(() => {});
  }, []);

  return (
    <DashboardLayout>
      <div className="dashboard-welcome">
        <h2>Welcome back, {user?.fullName}</h2>
        <p>Manage your e-learning platform from here.</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Courses</h3>
          <div className="stat-number">{stats.courses}</div>
        </div>
        <div className="stat-card">
          <h3>Published</h3>
          <div className="stat-number">{stats.published}</div>
        </div>
        <div className="stat-card">
          <h3>Unpublished</h3>
          <div className="stat-number">{stats.courses - stats.published}</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
        <div className="card" style={{ flex:1, minWidth:'200px', cursor:'pointer' }}
          onClick={() => navigate('/admin/courses')}>
          <h3 style={{ fontWeight:600, marginBottom:'0.5rem' }}>📚 Manage Courses</h3>
          <p style={{ color:'#888', fontSize:'0.875rem' }}>Create, edit, and publish courses</p>
        </div>
        <div className="card" style={{ flex:1, minWidth:'200px', cursor:'pointer' }}
          onClick={() => navigate('/admin/students')}>
          <h3 style={{ fontWeight:600, marginBottom:'0.5rem' }}>👥 View Students</h3>
          <p style={{ color:'#888', fontSize:'0.875rem' }}>Monitor student performance</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
