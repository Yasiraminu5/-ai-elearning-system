import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getRecommendations } from '../../api/recommendations';
import { enrollCourse } from '../../api/courses';
import DashboardLayout from '../../layouts/DashboardLayout';

const difficultyColor = {
  beginner:     'badge-green',
  intermediate: 'badge-blue',
  advanced:     'badge-purple',
};

const StudentRecommendations = () => {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRecommendations(); }, []);

  const fetchRecommendations = async () => {
    try {
      const { data: res } = await getRecommendations();
      setData(res.recommendation);
    } catch {
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await enrollCourse(courseId);
      toast.success('Enrolled successfully!');
      fetchRecommendations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    }
  };

  if (loading) return <div className="loading-screen">Generating recommendations...</div>;

  const courses = data?.recommendedCourses || [];
  const quizzes = data?.recommendedQuizzes || [];
  const path    = data?.learningPath       || [];

  return (
    <DashboardLayout>
      <div className="dashboard-welcome">
        <h2>💡 Your Personalized Recommendations</h2>
        <p>Generated based on your interests, performance, and learning progress.</p>
      </div>

      {/* Recommended Courses */}
      <div style={{ marginBottom:'2rem' }}>
        <h3 className="section-title">📚 Recommended Courses</h3>
        {courses.length === 0 ? (
          <div className="empty-state">
            <h3>No course recommendations yet</h3>
            <p>Enroll in a course or update your interests to get personalized recommendations.</p>
            <button className="btn btn-primary btn-sm"
              style={{ marginTop:'1rem' }}
              onClick={() => navigate('/student/courses')}>
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="card-grid">
            {courses.map((item, index) => (
              <div key={index} className="card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem' }}>
                  <h4 style={{ fontWeight:600, color:'#222', flex:1 }}>
                    {item.courseId?.title || 'Course'}
                  </h4>
                  <span className={`badge ${difficultyColor[item.courseId?.difficultyLevel] || 'badge-blue'}`}>
                    {item.courseId?.difficultyLevel}
                  </span>
                </div>
                <p style={{ fontSize:'0.8rem', color:'#888', marginBottom:'0.75rem' }}>
                  📂 {item.courseId?.category}
                </p>
                <div style={{
                  background:'#f0f4f8', borderRadius:'8px',
                  padding:'0.6rem 0.75rem', marginBottom:'0.75rem',
                  fontSize:'0.8rem', color:'#555',
                }}>
                  💡 {item.reason}
                </div>
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  <button className="btn btn-primary btn-sm"
                    onClick={() => handleEnroll(item.courseId?._id)}>
                    Enroll Now
                  </button>
                  <button className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/student/courses/${item.courseId?._id}`)}>
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Quizzes */}
      {quizzes.length > 0 && (
        <div style={{ marginBottom:'2rem' }}>
          <h3 className="section-title">📝 Quizzes You Are Ready For</h3>
          <div className="card-grid">
            {quizzes.map((item, index) => (
              <div key={index} className="card">
                <h4 style={{ fontWeight:600, marginBottom:'0.5rem' }}>
                  {item.quizId?.title || 'Quiz'}
                </h4>
                <p style={{ fontSize:'0.8rem', color:'#888', marginBottom:'0.75rem' }}>
                  Pass mark: {item.quizId?.passMark}% &nbsp;|&nbsp;
                  Difficulty: {item.quizId?.difficultyLevel}
                </p>
                <div style={{
                  background:'#f0f4f8', borderRadius:'8px',
                  padding:'0.6rem 0.75rem', marginBottom:'0.75rem',
                  fontSize:'0.8rem', color:'#555',
                }}>
                  💡 {item.reason}
                </div>
                <button className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/student/quiz/${item.quizId?._id}`)}>
                  Take Quiz
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Path */}
      {path.length > 0 && (
        <div>
          <h3 className="section-title">🗺️ Your Personalized Learning Path</h3>
          <div className="card">
            {path.map((step, index) => (
              <div key={index} style={{
                display:'flex', alignItems:'center', gap:'1rem',
                padding:'0.75rem 0',
                borderBottom: index < path.length - 1 ? '1px solid #e2e8f0' : 'none',
              }}>
                <div style={{
                  width:'32px', height:'32px', borderRadius:'50%', flexShrink:0,
                  background: step.status === 'in-progress'
                    ? 'linear-gradient(135deg,#667eea,#764ba2)'
                    : step.status === 'completed' ? '#c6f6d5' : '#e2e8f0',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.8rem', fontWeight:700,
                  color: step.status === 'in-progress' ? '#fff'
                    : step.status === 'completed' ? '#276749' : '#888',
                }}>
                  {step.status === 'completed' ? '✓' : index + 1}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:500, color:'#222' }}>
                    {step.courseId?.title || 'Course'}
                  </div>
                  <div style={{ fontSize:'0.8rem', color:'#888' }}>
                    {step.courseId?.category} — {step.courseId?.difficultyLevel}
                  </div>
                </div>
                <span className={`badge ${
                  step.status === 'in-progress' ? 'badge-blue'
                    : step.status === 'completed' ? 'badge-green'
                    : 'badge-purple'
                }`}>
                  {step.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentRecommendations;
