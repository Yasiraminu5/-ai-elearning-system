import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEnrolledCourses } from '../../api/courses';
import DashboardLayout from '../../layouts/DashboardLayout';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEnrolledCourses().then(({ data }) => {
      setEnrollments(data.enrollments || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const completed = enrollments.filter(e => e.status === 'completed').length;
  const inProgress = enrollments.filter(e => e.status === 'active').length;

  return (
    <DashboardLayout>
      <div className="dashboard-welcome">
        <h2>Welcome back, {user?.fullName}! 👋</h2>
        <p>Continue your learning journey.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Enrolled Courses</h3>
          <div className="stat-number">{enrollments.length}</div>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <div className="stat-number">{inProgress}</div>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <div className="stat-number">{completed}</div>
        </div>
      </div>

      {!loading && enrollments.length > 0 && (
        <div>
          <h3 className="section-title">Continue Learning</h3>
          <div className="card-grid">
            {enrollments.slice(0, 3).map(e => (
              <div key={e._id} className="card"
                style={{ cursor:'pointer' }}
                onClick={() => navigate(`/student/courses/${e.courseId?._id}`)}>
                <h4 style={{ fontWeight:600, marginBottom:'0.5rem' }}>{e.courseId?.title}</h4>
                <div style={{ background:'#e2e8f0', borderRadius:'999px', height:'6px', marginBottom:'0.5rem' }}>
                  <div style={{
                    background:'linear-gradient(135deg,#667eea,#764ba2)',
                    width:`${e.progressPercent || 0}%`, height:'100%', borderRadius:'999px',
                  }} />
                </div>
                <span style={{ fontSize:'0.8rem', color:'#888' }}>{e.progressPercent || 0}% complete</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && enrollments.length === 0 && (
        <div className="card" style={{ textAlign:'center', padding:'2rem' }}>
          <h3 style={{ marginBottom:'0.5rem' }}>Start Learning Today</h3>
          <p style={{ color:'#888', marginBottom:'1rem' }}>Browse available courses and enroll to begin.</p>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/student/courses')}>
            Browse Courses
          </button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;
