import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCourse, enrollCourse, getEnrolledCourses, completeLesson } from '../../api/courses';

const StudentCourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse]         = useState(null);
  const [lessons, setLessons]       = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [courseRes, enrolledRes] = await Promise.all([
        getCourse(id),
        getEnrolledCourses(),
      ]);
      setCourse(courseRes.data.course);
      setLessons(courseRes.data.lessons || []);
      const found = (enrolledRes.data.enrollments || []).find(
        e => e.courseId?._id === id
      );
      setEnrollment(found || null);
      if (courseRes.data.lessons?.length > 0) {
        setActiveLesson(courseRes.data.lessons[0]);
      }
    } catch {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await enrollCourse(id);
      toast.success('Enrolled successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const handleCompleteLesson = async (lessonId) => {
    try {
      const { data } = await completeLesson(lessonId);
      toast.success(`Progress: ${data.progressPercent}%`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark lesson complete');
    }
  };

  const isLessonCompleted = (lessonId) => {
    return enrollment?.completedLessons?.includes(lessonId);
  };

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!course)  return <div className="empty-state"><h3>Course not found</h3></div>;

  return (
    <div>
      <button onClick={() => navigate('/student/courses')}
        style={{ background:'none', border:'none', color:'#667eea', cursor:'pointer', marginBottom:'1rem', fontSize:'0.9rem' }}>
        ← Back to Courses
      </button>

      <div className="card" style={{ marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <h2 style={{ fontSize:'1.4rem', fontWeight:700, marginBottom:'0.5rem' }}>{course.title}</h2>
            <p style={{ color:'#666', marginBottom:'0.75rem' }}>{course.description}</p>
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
              <span className="badge badge-blue">{course.category}</span>
              <span className="badge badge-purple">{course.difficultyLevel}</span>
            </div>
          </div>
          {!enrollment ? (
            <button className="btn btn-primary btn-sm" onClick={handleEnroll}>
              Enroll Now
            </button>
          ) : (
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:'0.8rem', color:'#888', marginBottom:'0.25rem' }}>Progress</div>
              <div style={{ fontSize:'1.5rem', fontWeight:700, color:'#667eea' }}>
                {enrollment.progressPercent || 0}%
              </div>
            </div>
          )}
        </div>

        {enrollment && (
          <div style={{ marginTop:'1rem' }}>
            <div style={{ background:'#e2e8f0', borderRadius:'999px', height:'8px', overflow:'hidden' }}>
              <div style={{
                background:'linear-gradient(135deg,#667eea,#764ba2)',
                width:`${enrollment.progressPercent || 0}%`,
                height:'100%', borderRadius:'999px',
                transition:'width 0.3s',
              }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'1.5rem' }}>
        <div>
          <h3 className="section-title">Lessons ({lessons.length})</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            {lessons.map((lesson, index) => (
              <div key={lesson._id}
                onClick={() => setActiveLesson(lesson)}
                style={{
                  padding:'0.75rem 1rem', borderRadius:'8px', cursor:'pointer',
                  background: activeLesson?._id === lesson._id ? '#667eea' : '#fff',
                  color: activeLesson?._id === lesson._id ? '#fff' : '#333',
                  boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                }}>
                <span style={{ fontSize:'0.9rem', fontWeight:500 }}>
                  {index + 1}. {lesson.title}
                </span>
                {isLessonCompleted(lesson._id) && <span>✓</span>}
              </div>
            ))}
          </div>
        </div>

        <div>
          {activeLesson ? (
            <div className="card">
              <h3 style={{ fontSize:'1.1rem', fontWeight:600, marginBottom:'1rem' }}>
                {activeLesson.title}
              </h3>
              <div style={{ color:'#444', lineHeight:1.8, marginBottom:'1.5rem', whiteSpace:'pre-wrap' }}>
                {activeLesson.content}
              </div>
              {activeLesson.videoUrl && (
                <a href={activeLesson.videoUrl} target="_blank" rel="noreferrer"
                  style={{ color:'#667eea', fontSize:'0.9rem', display:'block', marginBottom:'1rem' }}>
                  🎥 Watch Video
                </a>
              )}
              {enrollment && !isLessonCompleted(activeLesson._id) && (
                <button className="btn btn-primary btn-sm"
                  onClick={() => handleCompleteLesson(activeLesson._id)}>
                  Mark as Complete
                </button>
              )}
              {isLessonCompleted(activeLesson._id) && (
                <span className="badge badge-green">✓ Completed</span>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Select a lesson to begin</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCourseDetail;
// Quiz navigation is available via /student/quiz/:id
