import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllCourses } from '../../api/courses';
import { getAllResults } from '../../api/quizzes';
import API from '../../api/axios';
import DashboardLayout from '../../layouts/DashboardLayout';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [stats, setStats] = useState({
    courses: 0, published: 0, students: 0, quizAttempts: 0,
  });

  useEffect(() => {
    Promise.all([
      getAllCourses(),
      API.get('/auth/students'),
      getAllResults(),
    ]).then(([cRes, sRes, rRes]) => {
      const courses  = cRes.data.courses  || [];
      const students = sRes.data.students || [];
      const results  = rRes.data.results  || [];
      setStats({
        courses:      courses.length,
        published:    courses.filter(c => c.isPublished).length,
        students:     students.length,
        quizAttempts: results.length,
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
          <h3>Total Students</h3>
          <div className="stat-number">{stats.students}</div>
        </div>
        <div className="stat-card">
          <h3>Quiz Attempts</h3>
          <div className="stat-number">{stats.quizAttempts}</div>
        </div>
      </div>

      <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', marginTop:'1rem' }}>
        <div className="card" style={{ flex:1, minWidth:'200px', cursor:'pointer' }}
          onClick={() => navigate('/admin/courses')}>
          <h3 style={{ fontWeight:600, marginBottom:'0.5rem' }}>📚 Manage Courses</h3>
          <p style={{ color:'#888', fontSize:'0.875rem' }}>Create, edit, and publish courses and lessons</p>
        </div>
        <div className="card" style={{ flex:1, minWidth:'200px', cursor:'pointer' }}
          onClick={() => navigate('/admin/quizzes')}>
          <h3 style={{ fontWeight:600, marginBottom:'0.5rem' }}>📝 Manage Quizzes</h3>
          <p style={{ color:'#888', fontSize:'0.875rem' }}>Create and manage course quizzes</p>
        </div>
        <div className="card" style={{ flex:1, minWidth:'200px', cursor:'pointer' }}
          onClick={() => navigate('/admin/students')}>
          <h3 style={{ fontWeight:600, marginBottom:'0.5rem' }}>👥 View Students</h3>
          <p style={{ color:'#888', fontSize:'0.875rem' }}>Monitor student enrollment and performance</p>
        </div>
        <div className="card" style={{ flex:1, minWidth:'200px', cursor:'pointer' }}
          onClick={() => navigate('/admin/reports')}>
          <h3 style={{ fontWeight:600, marginBottom:'0.5rem' }}>📊 Performance Reports</h3>
          <p style={{ color:'#888', fontSize:'0.875rem' }}>View all quiz results and analytics</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
